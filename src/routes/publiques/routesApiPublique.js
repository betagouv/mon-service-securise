const express = require('express');
const { DUREE_SESSION } = require('../../http/configurationServeur');
const Utilisateur = require('../../modeles/utilisateur');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');
const {
  ErreurUtilisateurExistant,
  EchecEnvoiMessage,
  ErreurModele,
} = require('../../erreurs');

const routesApiPublique = ({
  middleware,
  referentiel,
  depotDonnees,
  adaptateurAnnuaire,
  adaptateurTracking,
  adaptateurMail,
}) => {
  const routes = express.Router();

  routes.post(
    '/utilisateur',
    middleware.aseptise(...Utilisateur.nomsProprietesBase()),
    (requete, reponse, suite) => {
      const obtentionDonneesDeBaseUtilisateur = (corps) => ({
        prenom: corps.prenom,
        nom: corps.nom,
        telephone: corps.telephone,
        nomEntitePublique: corps.nomEntitePublique,
        departementEntitePublique: corps.departementEntitePublique,
        infolettreAcceptee: valeurBooleenne(corps.infolettreAcceptee),
        postes: corps.postes,
      });

      const messageErreurDonneesUtilisateur = (
        donneesRequete,
        utilisateurExistant = false
      ) => {
        try {
          Utilisateur.valideDonnees(
            donneesRequete,
            referentiel,
            utilisateurExistant
          );
          return { donneesInvalides: false };
        } catch (erreur) {
          return { donneesInvalides: true, messageErreur: erreur.message };
        }
      };

      const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) =>
        promesseEnvoiMessage
          .then(() => utilisateur)
          .catch(() =>
            depotDonnees
              .supprimeUtilisateur(utilisateur.id)
              .then(() => Promise.reject(new EchecEnvoiMessage()))
          );

      const creeContactEmail = (utilisateur) =>
        verifieSuccesEnvoiMessage(
          adaptateurMail.creeContact(
            utilisateur.email,
            utilisateur.prenom ?? '',
            utilisateur.nom ?? '',
            !utilisateur.infolettreAcceptee
          ),
          utilisateur
        );

      const envoieMessageFinalisationInscription = (utilisateur) =>
        verifieSuccesEnvoiMessage(
          adaptateurMail.envoieMessageFinalisationInscription(
            utilisateur.email,
            utilisateur.idResetMotDePasse,
            utilisateur.prenom
          ),
          utilisateur
        );

      const donnees = obtentionDonneesDeBaseUtilisateur(requete.body);
      donnees.cguAcceptees = valeurBooleenne(requete.body.cguAcceptees);
      donnees.email = requete.body.email?.toLowerCase();

      const { donneesInvalides, messageErreur } =
        messageErreurDonneesUtilisateur(donnees);
      if (donneesInvalides) {
        reponse
          .status(422)
          .send(
            `La création d'un nouvel utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`
          );
      } else {
        depotDonnees
          .nouvelUtilisateur(donnees)
          .then(creeContactEmail)
          .then(envoieMessageFinalisationInscription)
          .then((utilisateur) => {
            adaptateurTracking.envoieTrackingInscription(utilisateur.email);
            return utilisateur;
          })
          .catch((erreur) => {
            if (erreur instanceof ErreurUtilisateurExistant) {
              return adaptateurMail
                .envoieNotificationTentativeReinscription(donnees.email)
                .then(() => ({ id: erreur.idUtilisateur }));
            }
            throw erreur;
          })
          .then(({ id }) => reponse.json({ idUtilisateur: id }))
          .catch((e) => {
            if (e instanceof EchecEnvoiMessage) {
              reponse
                .status(424)
                .send(
                  "L'envoi de l'email de finalisation d'inscription a échoué"
                );
            } else if (e instanceof ErreurModele) {
              reponse.status(422).send(e.message);
            } else suite(e);
          });
      }
    }
  );

  routes.post('/reinitialisationMotDePasse', (requete, reponse, suite) => {
    const email = requete.body.email?.toLowerCase();

    depotDonnees
      .reinitialiseMotDePasse(email)
      .then((utilisateur) => {
        if (utilisateur) {
          adaptateurMail.envoieMessageReinitialisationMotDePasse(
            utilisateur.email,
            utilisateur.idResetMotDePasse
          );
        }
      })
      .then(() => reponse.send(''))
      .catch(suite);
  });

  routes.post('/token', (requete, reponse, suite) => {
    const login = requete.body.login?.toLowerCase();
    const { motDePasse } = requete.body;
    depotDonnees
      .utilisateurAuthentifie(login, motDePasse)
      .then((utilisateur) => {
        if (utilisateur) {
          const token = utilisateur.genereToken();
          requete.session.token = token;
          depotDonnees.homologations(utilisateur.id).then((services) =>
            adaptateurTracking.envoieTrackingConnexion(utilisateur.email, {
              nombreServices: services.length,
            })
          );
          depotDonnees
            .lisParcoursUtilisateur(utilisateur.id)
            .then((parcoursUtilisateur) => {
              const nouvelleFonctionnalite =
                parcoursUtilisateur.recupereNouvelleFonctionnalite();
              parcoursUtilisateur.enregistreDerniereConnexionMaintenant();
              depotDonnees
                .sauvegardeParcoursUtilisateur(parcoursUtilisateur)
                .then(() =>
                  reponse.json({
                    utilisateur: utilisateur.toJSON(),
                    nouvelleFonctionnalite,
                  })
                );
            });
        } else {
          reponse.status(401).send("L'authentification a échoué");
        }
      })
      .catch(suite);
  });

  routes.get('/dureeSession', (_requete, reponse) => {
    reponse.send({ dureeSession: DUREE_SESSION });
  });

  routes.get('/annuaire/suggestions', (requete, reponse) => {
    const { recherche = '', departement = null } = requete.query;

    if (recherche === '') {
      reponse.status(400).send('Le terme de recherche ne peut pas être vide');
      return;
    }
    if (departement !== null && !referentiel.estCodeDepartement(departement)) {
      reponse.status(400).send('Le département doit être valide (01 à 989)');
      return;
    }

    adaptateurAnnuaire
      .rechercheOrganisation(recherche, departement)
      .then((suggestions) => reponse.status(200).json({ suggestions }));
  });

  routes.post(
    '/desinscriptionInfolettre',
    middleware.verificationAddresseIP(['185.107.232.1/24', '1.179.112.1/20']),
    (requete, reponse, suite) => {
      const { event: typeEvenement, email } = requete.body;

      if (typeEvenement !== 'unsubscribe') {
        reponse
          .status(400)
          .json({ erreur: "L'événement doit être de type 'unsubscribe'" });
        return;
      }

      if (!email) {
        reponse
          .status(400)
          .json({ erreur: "Le champ 'email' doit être présent" });
        return;
      }

      depotDonnees.utilisateurAvecEmail(email).then((utilisateur) => {
        if (!utilisateur) {
          reponse
            .status(424)
            .json({ erreur: `L'email '${email}' est introuvable` });
          return;
        }
        depotDonnees
          .metsAJourUtilisateur(utilisateur.id, {
            ...utilisateur,
            infolettreAcceptee: false,
          })
          .then(() => reponse.sendStatus(200))
          .catch(suite);
      });
    }
  );

  routes.get(
    '/nouvelleFonctionnalite/:id',
    middleware.aseptise('id'),
    (requete, reponse) => {
      const idNouvelleFonctionnalite = requete.params.id;
      const nouvelleFonctionnalite = referentiel.nouvelleFonctionnalite(
        idNouvelleFonctionnalite
      );

      if (!nouvelleFonctionnalite) {
        reponse.status(404).send('Nouvelle fonctionnalité inconnue');
        return;
      }

      reponse.render(
        `nouvellesFonctionnalites/${nouvelleFonctionnalite.fichierPug}`
      );
    }
  );

  return routes;
};

module.exports = routesApiPublique;

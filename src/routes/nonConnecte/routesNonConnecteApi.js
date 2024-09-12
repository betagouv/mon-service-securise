const express = require('express');
const Utilisateur = require('../../modeles/utilisateur');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');
const {
  ErreurUtilisateurExistant,
  EchecEnvoiMessage,
  ErreurModele,
} = require('../../erreurs');
const {
  messageErreurDonneesUtilisateur,
  obtentionDonneesDeBaseUtilisateur,
} = require('../mappeur/utilisateur');

const routesNonConnecteApi = ({
  middleware,
  referentiel,
  depotDonnees,
  serviceAnnuaire,
  adaptateurTracking,
  adaptateurMail,
}) => {
  const routes = express.Router();

  routes.post(
    '/utilisateur',
    middleware.protegeTrafic(),
    middleware.aseptise(...Utilisateur.nomsProprietesBase(), 'siretEntite'),
    async (requete, reponse, suite) => {
      const verifieSuccesEnvoiMessage = async (promesseEnvoiMessage) => {
        try {
          await promesseEnvoiMessage;
        } catch {
          throw new EchecEnvoiMessage();
        }
      };

      const creeContactEmail = async (utilisateur) => {
        await verifieSuccesEnvoiMessage(
          adaptateurMail.creeContact(
            utilisateur.email,
            utilisateur.prenom ?? '',
            utilisateur.nom ?? '',
            utilisateur.telephone ?? '',
            !utilisateur.infolettreAcceptee,
            false
          )
        );
      };

      const envoieMessageFinalisationInscription = async (utilisateur) => {
        await verifieSuccesEnvoiMessage(
          adaptateurMail.envoieMessageFinalisationInscription(
            utilisateur.email,
            utilisateur.idResetMotDePasse,
            utilisateur.prenom
          )
        );
      };

      const donnees = obtentionDonneesDeBaseUtilisateur(requete.body);
      donnees.cguAcceptees = valeurBooleenne(requete.body.cguAcceptees);
      donnees.email = requete.body.email?.toLowerCase();
      const { donneesInvalides, messageErreur } =
        messageErreurDonneesUtilisateur(donnees, false);

      if (donneesInvalides) {
        reponse
          .status(422)
          .send(
            `La création d'un nouvel utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`
          );
      } else {
        try {
          await creeContactEmail(donnees);
          const utilisateur = await depotDonnees.nouvelUtilisateur(donnees);
          if (!requete.body.ac) {
            await envoieMessageFinalisationInscription(utilisateur);
          }

          await adaptateurTracking.envoieTrackingInscription(utilisateur.email);

          reponse.json({ idUtilisateur: utilisateur.id });
        } catch (e) {
          if (e instanceof ErreurUtilisateurExistant) {
            await adaptateurMail.envoieNotificationTentativeReinscription(
              donnees.email
            );
            reponse.json({ idUtilisateur: e.idUtilisateur });
          } else if (e instanceof EchecEnvoiMessage) {
            reponse
              .status(424)
              .send(
                "L'envoi de l'email de finalisation d'inscription a échoué"
              );
          } else if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else suite(e);
        }
      }
    }
  );

  routes.post(
    '/reinitialisationMotDePasse',
    middleware.protegeTrafic(),
    (requete, reponse, suite) => {
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
    }
  );

  routes.post(
    '/token',
    middleware.protegeTrafic(),
    async (requete, reponse, suite) => {
      const login = requete.body.login?.toLowerCase();
      const { motDePasse } = requete.body;

      try {
        const utilisateur = await depotDonnees.utilisateurAuthentifie(
          login,
          motDePasse
        );

        if (!utilisateur) {
          reponse.status(401).send("L'authentification a échoué");
          return;
        }

        const token = utilisateur.genereToken();
        requete.session.token = token;

        await depotDonnees.enregistreNouvelleConnexionUtilisateur(
          utilisateur.id,
          'MSS'
        );

        reponse.sendStatus(200);
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.get(
    '/annuaire/organisations',
    middleware.aseptise('recherche', 'departement'),
    (requete, reponse) => {
      const { recherche = '', departement = null } = requete.query;

      if (recherche === '') {
        reponse.status(400).send('Le terme de recherche ne peut pas être vide');
        return;
      }
      if (
        departement !== null &&
        !referentiel.estCodeDepartement(departement)
      ) {
        reponse.status(400).send('Le département doit être valide (01 à 989)');
        return;
      }

      serviceAnnuaire
        .rechercheOrganisations(recherche, departement)
        .then((suggestions) => reponse.status(200).json({ suggestions }));
    }
  );

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
            transactionnelAccepte: false,
          })
          .then(() => reponse.sendStatus(200))
          .catch(suite);
      });
    }
  );

  return routes;
};

module.exports = routesNonConnecteApi;

const express = require('express');

const { valeurBooleenne } = require('../utilitaires/aseptisation');
const { DUREE_SESSION } = require('../http/configurationServeur');
const { resultatValidation, valideMotDePasse } = require('../http/validationMotDePasse');
const {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurModele,
  ErreurUtilisateurExistant,
} = require('../erreurs');
const routesApiService = require('./routesApiService');
const Utilisateur = require('../modeles/utilisateur');
const objetGetServices = require('../modeles/objetsApi/objetGetServices');

const routesApi = (
  middleware,
  adaptateurMail,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurAnnuaire
) => {
  const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) => promesseEnvoiMessage
    .then(() => utilisateur)
    .catch(() => depotDonnees.supprimeUtilisateur(utilisateur.id)
      .then(() => Promise.reject(new EchecEnvoiMessage())));

  const creeContactEmail = (utilisateur) => (
    verifieSuccesEnvoiMessage(
      adaptateurMail.creeContact(
        utilisateur.email, utilisateur.prenom ?? '', utilisateur.nom ?? '', !utilisateur.infolettreAcceptee
      ),
      utilisateur,
    ));

  const envoieMessageInvitationInscription = (emetteur, contributeur, service) => (
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageInvitationInscription(
        contributeur.email,
        emetteur.prenomNom(),
        service.nomService(),
        contributeur.idResetMotDePasse,
      ),
      contributeur,
    ));

  const envoieMessageFinalisationInscription = (utilisateur) => (
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageFinalisationInscription(
        utilisateur.email, utilisateur.idResetMotDePasse, utilisateur.prenom,
      ),
      utilisateur,
    ));

  const envoieMessageInvitationContribution = (emetteur, contributeur, service) => (
    adaptateurMail.envoieMessageInvitationContribution(
      contributeur.email,
      emetteur.prenomNom(),
      service.nomService(),
      service.id,
    )
      .then(() => contributeur)
  );

  const obtentionDonneesDeBaseUtilisateur = (corps) => ({
    prenom: corps.prenom,
    nom: corps.nom,
    telephone: corps.telephone,
    rssi: valeurBooleenne(corps.rssi),
    delegueProtectionDonnees: valeurBooleenne(corps.delegueProtectionDonnees),
    poste: corps.poste,
    nomEntitePublique: corps.nomEntitePublique,
    departementEntitePublique: corps.departementEntitePublique,
    infolettreAcceptee: valeurBooleenne(corps.infolettreAcceptee),
  });

  const messageErreurDonneesUtilisateur = (donneesRequete, utilisateurExistant = false) => {
    try {
      Utilisateur.valideDonnees(donneesRequete, referentiel, utilisateurExistant);
      return { donneesInvalides: false };
    } catch (erreur) {
      return { donneesInvalides: true, messageErreur: erreur.message };
    }
  };

  const routes = express.Router();

  routes.get('/services', middleware.verificationAcceptationCGU, (requete, reponse) => {
    depotDonnees.homologations(requete.idUtilisateurCourant)
      .then((services) => objetGetServices.donnees(services, requete.idUtilisateurCourant))
      .then((donnees) => reponse.json(donnees));
  });

  routes.use('/service', routesApiService(middleware, depotDonnees, referentiel, adaptateurHorloge, adaptateurPdf));

  routes.get('/seuilCriticite', middleware.verificationAcceptationCGU, (requete, reponse) => {
    const {
      fonctionnalites = [],
      donneesCaracterePersonnel = [],
      delaiAvantImpactCritique,
    } = requete.query;
    try {
      const seuilCriticite = referentiel.criticite(
        fonctionnalites, donneesCaracterePersonnel, delaiAvantImpactCritique
      );
      reponse.json({ seuilCriticite });
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.post('/utilisateur',
    middleware.aseptise(...Utilisateur.nomsProprietesBase()),
    (requete, reponse, suite) => {
      const donnees = obtentionDonneesDeBaseUtilisateur(requete.body);
      donnees.cguAcceptees = valeurBooleenne(requete.body.cguAcceptees);
      donnees.email = requete.body.email?.toLowerCase();

      const { donneesInvalides, messageErreur } = messageErreurDonneesUtilisateur(donnees);
      if (donneesInvalides) {
        reponse.status(422).send(`La création d'un nouvel utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`);
      } else {
        depotDonnees.nouvelUtilisateur(donnees)
          .then(creeContactEmail)
          .then(envoieMessageFinalisationInscription)
          .catch((erreur) => {
            if (erreur instanceof ErreurUtilisateurExistant) {
              return adaptateurMail.envoieNotificationTentativeReinscription(donnees.email)
                .then(() => ({ id: erreur.idUtilisateur }));
            }
            throw erreur;
          })
          .then(({ id }) => reponse.json({ idUtilisateur: id }))
          .catch((e) => {
            if (e instanceof EchecEnvoiMessage) {
              reponse.status(424).send("L'envoi de l'email de finalisation d'inscription a échoué");
            } else if (e instanceof ErreurModele) {
              reponse.status(422).send(e.message);
            } else suite(e);
          });
      }
    });

  routes.post('/reinitialisationMotDePasse', (requete, reponse, suite) => {
    const email = requete.body.email?.toLowerCase();

    depotDonnees.reinitialiseMotDePasse(email)
      .then((utilisateur) => {
        if (utilisateur) {
          adaptateurMail.envoieMessageReinitialisationMotDePasse(
            utilisateur.email, utilisateur.idResetMotDePasse
          );
        }
      })
      .then(() => reponse.send(''))
      .catch(suite);
  });

  routes.put('/motDePasse',
    middleware.verificationJWT,
    middleware.aseptise('cguAcceptees'),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const cguDejaAcceptees = requete.cguAcceptees;
      const cguEnCoursDAcceptation = valeurBooleenne(requete.body.cguAcceptees);
      const { motDePasse } = requete.body;

      const pasDeMotDePasse = motDePasse === undefined;
      if (pasDeMotDePasse) {
        reponse.status(204).send();
        return;
      }

      const motDePasseInvalide = !(typeof motDePasse === 'string' && motDePasse);
      if (motDePasseInvalide) {
        reponse.status(422).send('Mot de passe invalide');
        return;
      }

      if (!cguDejaAcceptees && !cguEnCoursDAcceptation) {
        reponse.status(422).send('CGU non acceptées');
        return;
      }

      if (valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse)
        .then(depotDonnees.valideAcceptationCGUPourUtilisateur)
        .then(depotDonnees.supprimeIdResetMotDePassePourUtilisateur)
        .then((utilisateur) => {
          requete.session.token = utilisateur.genereToken();
          reponse.json({ idUtilisateur });
        })
        .catch(suite);
    });

  routes.put('/utilisateur',
    middleware.verificationJWT,
    middleware.aseptise([...Utilisateur.nomsProprietesBase().filter((nom) => nom !== 'email')]),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const donnees = obtentionDonneesDeBaseUtilisateur(requete.body);

      const { donneesInvalides, messageErreur } = messageErreurDonneesUtilisateur(donnees, true);
      if (donneesInvalides) {
        reponse.status(422).send(
          `La mise à jour de l'utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`
        );
        return;
      }

      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => {
          const acceptationInfolettreActuelle = utilisateur.infolettreAcceptee;
          const nouvelleAcceptationInfolettre = donnees.infolettreAcceptee;
          const doitInscrire = !acceptationInfolettreActuelle && nouvelleAcceptationInfolettre;
          const doitDesinscrire = acceptationInfolettreActuelle && !nouvelleAcceptationInfolettre;

          if (doitInscrire) return adaptateurMail.inscrisInfolettre(utilisateur.email);
          if (doitDesinscrire) return adaptateurMail.desinscrisInfolettre(utilisateur.email);
          return Promise.resolve();
        })
        .then(() => depotDonnees.metsAJourUtilisateur(idUtilisateur, donnees))
        .then(() => reponse.json({ idUtilisateur }))
        .catch(suite);
    });

  routes.get('/utilisateurCourant', middleware.verificationJWT, (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => {
          reponse.json({ utilisateur: utilisateur.toJSON() });
        });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  routes.post('/token', (requete, reponse, suite) => {
    const login = requete.body.login?.toLowerCase();
    const { motDePasse } = requete.body;
    depotDonnees.utilisateurAuthentifie(login, motDePasse)
      .then((utilisateur) => {
        if (utilisateur) {
          const token = utilisateur.genereToken();
          requete.session.token = token;
          reponse.json({ utilisateur: utilisateur.toJSON() });
        } else {
          reponse.status(401).send("L'authentification a échoué");
        }
      })
      .catch(suite);
  });

  routes.post('/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('emailContributeur'),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { idHomologation } = requete.body;
      const emailContributeur = requete.body.emailContributeur?.toLowerCase();

      const verifiePermission = (...params) => depotDonnees.autorisationPour(...params)
        .then((a) => (
          a.permissionAjoutContributeur
            ? Promise.resolve()
            : Promise.reject(new EchecAutorisation())
        ));

      const verifieAutorisationInexistante = (...params) => depotDonnees
        .autorisationExiste(...params)
        .then((existe) => (
          existe
            ? Promise.reject(new ErreurAutorisationExisteDeja("L'autorisation existe déjà"))
            : Promise.resolve()
        ));

      const creeContributeurSiNecessaire = (contributeurExistant) => (
        contributeurExistant
          ? Promise.resolve(contributeurExistant)
          : depotDonnees.nouvelUtilisateur({ email: emailContributeur, infolettreAcceptee: false })
            .then(creeContactEmail)
      );

      const informeContributeur = (contributeurAInformer, contributeurExistant) => (
        Promise.all([
          depotDonnees.utilisateur(idUtilisateur),
          depotDonnees.homologation(idHomologation),
        ])
          .then(([emetteur, service]) => (
            contributeurExistant
              ? envoieMessageInvitationContribution(emetteur, contributeurAInformer, service)
              : envoieMessageInvitationInscription(emetteur, contributeurAInformer, service)
          ))
      );

      const inviteContributeur = (contributeurExistant) => (
        verifieAutorisationInexistante(contributeurExistant?.id, idHomologation)
          .then(() => creeContributeurSiNecessaire(contributeurExistant, idHomologation))
          .then((c) => informeContributeur(c, contributeurExistant))
      );

      verifiePermission(idUtilisateur, idHomologation)
        .then(() => depotDonnees.utilisateurAvecEmail(emailContributeur))
        .then(inviteContributeur)
        .then((c) => depotDonnees.ajouteContributeurAHomologation(c.id, idHomologation))
        .then(() => reponse.send(''))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse.status(403).send("Ajout non autorisé d'un contributeur");
          } else if (e instanceof ErreurAutorisationExisteDeja) {
            reponse.status(422).json({ erreur: { code: 'INVITATION_DEJA_ENVOYEE' } });
          } else if (e instanceof EchecEnvoiMessage) {
            reponse.status(424).send("L'envoi de l'email de finalisation d'inscription a échoué");
          } else if (e instanceof ErreurModele) reponse.status(422).send(e.message);
          else suite(e);
        });
    });

  routes.get('/dureeSession', (_requete, reponse) => {
    reponse.send({ dureeSession: DUREE_SESSION });
  });

  routes.get('/annuaire/suggestions', (requete, reponse) => {
    const {
      recherche = '',
      departement = null,
    } = requete.query;

    if (recherche === '') {
      reponse.status(400).send('Le terme de recherche ne peut pas être vide');
      return;
    }
    if (departement !== null && !referentiel.estCodeDepartement(departement)) {
      reponse.status(400).send('Le département doit être valide (01 à 989)');
      return;
    }

    adaptateurAnnuaire.rechercheOrganisation(recherche, departement)
      .then((suggestions) => reponse.status(200).json({ suggestions }));
  });

  routes.post('/desinscriptionInfolettre', middleware.verificationAddresseIP(['185.107.232.1/24', '1.179.112.1/20']), (requete, reponse, suite) => {
    const { event: typeEvenement, email } = requete.body;

    if (typeEvenement !== 'unsubscribe') {
      reponse.status(400).json({ erreur: "L'événement doit être de type 'unsubscribe'" });
      return;
    }

    if (!email) {
      reponse.status(400).json({ erreur: "Le champ 'email' doit être présent" });
      return;
    }

    depotDonnees.utilisateurAvecEmail(email)
      .then((utilisateur) => {
        if (!utilisateur) {
          reponse.status(424).json({ erreur: `L'email '${email}' est introuvable` });
          return;
        }
        depotDonnees
          .metsAJourUtilisateur(utilisateur.id, { ...utilisateur, infolettreAcceptee: false })
          .then(() => reponse.sendStatus(200))
          .catch(suite);
      });
  });

  return routes;
};

module.exports = routesApi;

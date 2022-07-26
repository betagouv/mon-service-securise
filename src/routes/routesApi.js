const express = require('express');

const { DUREE_SESSION } = require('../configurationServeur');
const {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurModele,
} = require('../erreurs');
const routesApiHomologation = require('./routesApiHomologation');
const Utilisateur = require('../modeles/utilisateur');

const routesApi = (middleware, adaptateurMail, depotDonnees, referentiel) => {
  const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) => promesseEnvoiMessage
    .then(() => utilisateur)
    .catch(() => depotDonnees.supprimeUtilisateur(utilisateur.id)
      .then(() => Promise.reject(new EchecEnvoiMessage())));

  const envoieMessageInvitationInscription = (emetteur, contributeur, homologation) => (
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageInvitationInscription(
        contributeur.email,
        emetteur.prenomNom(),
        homologation.nomService(),
        contributeur.idResetMotDePasse,
      ),
      contributeur,
    ));

  const envoieMessageFinalisationInscription = (utilisateur) => (
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageFinalisationInscription(
        utilisateur.email, utilisateur.idResetMotDePasse,
      ),
      utilisateur,
    ));

  const envoieMessageInvitationContribution = (emetteur, contributeur, homologation) => (
    adaptateurMail.envoieMessageInvitationContribution(
      contributeur.email,
      emetteur.prenomNom(),
      homologation.nomService(),
      homologation.id,
    )
      .then(() => contributeur)
  );

  const routes = express.Router();

  routes.get('/homologations', middleware.verificationAcceptationCGU, (requete, reponse) => {
    depotDonnees.homologations(requete.idUtilisateurCourant)
      .then((homologations) => homologations.map((h) => h.toJSON()))
      .then((homologations) => reponse.json({ homologations }));
  });

  routes.use('/homologation', routesApiHomologation(middleware, depotDonnees, referentiel));

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
    middleware.aseptise('prenom', 'nom', 'email', 'telephone', 'rssi', 'delegueProtectionDonnees', 'poste', 'nomEntitePublique', 'departementEntitePublique'),
    (requete, reponse, suite) => {
      const valeurBooleene = (valeur) => {
        switch (valeur) {
          case 'true': return true;
          case 'false': return false;
          default: return undefined;
        }
      };

      const donnees = {
        prenom: requete.body.prenom,
        nom: requete.body.nom,
        telephone: requete.body.telephone,
        rssi: valeurBooleene(requete.body.rssi),
        delegueProtectionDonnees: valeurBooleene(requete.body.delegueProtectionDonnees),
        poste: requete.body.poste,
        nomEntitePublique: requete.body.nomEntitePublique,
        departementEntitePublique: requete.body.departementEntitePublique,
        email: requete.body.email?.toLowerCase(),
      };

      new Promise((resolve, reject) => {
        try {
          Utilisateur.valideCreationNouvelUtilisateur(donnees, referentiel);
          resolve();
        } catch (erreur) {
          reject(new ErreurModele("La création d'un nouvel utilisateur car les paramètres sont invalides"));
        }
      }).then(() => depotDonnees.nouvelUtilisateur(donnees))
        .then(envoieMessageFinalisationInscription)
        .then((u) => reponse.json({ idUtilisateur: u.id }))
        .catch((e) => {
          if (e instanceof EchecEnvoiMessage) {
            reponse.status(424).send("L'envoi de l'email de finalisation d'inscription a échoué");
          } else if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else suite(e);
        });
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

  routes.put('/utilisateur', middleware.verificationJWT, (requete, reponse, suite) => {
    const idUtilisateur = requete.idUtilisateurCourant;

    depotDonnees.utilisateur(idUtilisateur)
      .then((utilisateur) => {
        const { prenom, nom, motDePasse, cguAcceptees } = requete.body;

        const metsAJourMotDePasseSiNecessaire = () => {
          if (typeof motDePasse !== 'string' || !motDePasse) return Promise.resolve(utilisateur);
          return depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
        };

        if (!utilisateur.accepteCGU() && !cguAcceptees) {
          reponse.status(422).send('CGU non acceptées');
        } else {
          metsAJourMotDePasseSiNecessaire()
            .then((u) => depotDonnees.metsAJourUtilisateur(u.id, { prenom, nom }))
            .then(depotDonnees.valideAcceptationCGUPourUtilisateur)
            .then(depotDonnees.supprimeIdResetMotDePassePourUtilisateur)
            .then((u) => {
              const token = u.genereToken();
              requete.session.token = token;
              reponse.json({ idUtilisateur });
            })
            .catch(suite);
        }
      });
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
      const { emailContributeur, idHomologation } = requete.body;

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
          : depotDonnees.nouvelUtilisateur({ email: emailContributeur })
      );

      const informeContributeur = (contributeurAInformer, contributeurExistant) => (
        Promise.all([
          depotDonnees.utilisateur(idUtilisateur),
          depotDonnees.homologation(idHomologation),
        ])
          .then(([emetteur, homologation]) => (
            contributeurExistant
              ? envoieMessageInvitationContribution(emetteur, contributeurAInformer, homologation)
              : envoieMessageInvitationInscription(emetteur, contributeurAInformer, homologation)
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
          } else if (e instanceof EchecEnvoiMessage) {
            reponse.status(424).send("L'envoi de l'email de finalisation d'inscription a échoué");
          } else if (e instanceof ErreurModele) reponse.status(422).send(e.message);
          else suite(e);
        });
    });

  routes.get('/dureeSession', (_requete, reponse) => {
    reponse.send({ dureeSession: DUREE_SESSION });
  });

  return routes;
};

module.exports = routesApi;

const express = require('express');

const { DUREE_SESSION } = require('../configurationServeur');
const {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurCGUNonAcceptees,
  ErreurModele,
  ErreurUtilisateurExistant,
} = require('../erreurs');
const routesApiService = require('./routesApiService');
const Utilisateur = require('../modeles/utilisateur');

const routesApi = (middleware, adaptateurMail, depotDonnees, referentiel) => {
  const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) => promesseEnvoiMessage
    .then(() => utilisateur)
    .catch(() => depotDonnees.supprimeUtilisateur(utilisateur.id)
      .then(() => Promise.reject(new EchecEnvoiMessage())));

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
        utilisateur.email, utilisateur.idResetMotDePasse,
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

  const valeurBooleenne = (valeur) => {
    switch (valeur) {
      case 'true': return true;
      case 'false': return false;
      default: return undefined;
    }
  };

  const obtentionDonneesDeBaseUtilisateur = (corps) => ({
    prenom: corps.prenom,
    nom: corps.nom,
    telephone: corps.telephone,
    rssi: valeurBooleenne(corps.rssi),
    delegueProtectionDonnees: valeurBooleenne(corps.delegueProtectionDonnees),
    poste: corps.poste,
    nomEntitePublique: corps.nomEntitePublique,
    departementEntitePublique: corps.departementEntitePublique,
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

  routes.get('/homologations', middleware.verificationAcceptationCGU, (requete, reponse) => {
    depotDonnees.homologations(requete.idUtilisateurCourant)
      .then((services) => services.map((s) => s.toJSON()))
      .then((services) => reponse.json({ homologations: services }));
  });

  routes.use('/service', routesApiService(middleware, depotDonnees, referentiel));

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

  routes.put('/motDePasse', middleware.verificationJWT, (requete, reponse, suite) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    const cguDejaAcceptees = requete.cguAcceptees;
    const cguEnCoursDAcceptation = valeurBooleenne(requete.body.cguAcceptees);
    const { motDePasse } = requete.body;
    const motDePasseInvalide = !(typeof motDePasse === 'string' && motDePasse);

    if (motDePasseInvalide) {
      reponse.status(204).end();
      return;
    }

    if (!cguDejaAcceptees && !cguEnCoursDAcceptation) {
      reponse.status(422).send('CGU non acceptées');
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
      const cguAcceptees = valeurBooleenne(requete.body.cguAcceptees);
      const { motDePasse } = requete.body;

      const { donneesInvalides, messageErreur } = messageErreurDonneesUtilisateur(donnees, true);
      if (donneesInvalides) {
        reponse.status(422).send(`La mise à jour de l'utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`);
      } else {
        const motDePasseValide = (valeur) => (typeof valeur === 'string' && valeur);
        depotDonnees.utilisateur(idUtilisateur)
          .then((utilisateur) => {
            if (utilisateur.accepteCGU() || cguAcceptees) {
              return utilisateur;
            }
            throw new ErreurCGUNonAcceptees();
          })
          .then((utilisateur) => {
            if (motDePasseValide(motDePasse)) {
              return depotDonnees.metsAJourMotDePasse(utilisateur.id, motDePasse);
            }
            return utilisateur;
          })
          .then((utilisateur) => depotDonnees.metsAJourUtilisateur(utilisateur.id, donnees))
          .then(depotDonnees.valideAcceptationCGUPourUtilisateur)
          .then(depotDonnees.supprimeIdResetMotDePassePourUtilisateur)
          .then((utilisateur) => {
            const token = utilisateur.genereToken();
            requete.session.token = token;
            reponse.json({ idUtilisateur: utilisateur.id });
          })
          .catch((erreur) => {
            if (erreur instanceof ErreurCGUNonAcceptees) {
              reponse.status(422).send('CGU non acceptées');
            } else {
              suite(erreur);
            }
          });
      }
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
          : depotDonnees.nouvelUtilisateur({ email: emailContributeur })
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

const express = require('express');

const { ErreurModele } = require('../erreurs');
const routesApiHomologation = require('./routesApiHomologation');

const routesApi = (middleware, adaptateurMail, depotDonnees, referentiel) => {
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

  routes.post('/utilisateur', middleware.aseptise('prenom', 'nom', 'email'), (requete, reponse, suite) => {
    const { prenom, nom } = requete.body;
    const email = requete.body.email?.toLowerCase();

    depotDonnees.nouvelUtilisateur({ prenom, nom, email })
      .then((utilisateur) => (
        adaptateurMail.envoieMessageFinalisationInscription(
          utilisateur.email, utilisateur.idResetMotDePasse
        )
          .then(() => reponse.json({ idUtilisateur: utilisateur.id }))
          .catch(() => {
            depotDonnees.supprimeUtilisateur(utilisateur.id)
              .then(() => reponse.status(424).send(
                "L'envoi de l'email de finalisation d'inscription a échoué"
              ));
          })
      ))
      .catch((e) => {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
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
        const { motDePasse, cguAcceptees } = requete.body;

        if (typeof motDePasse !== 'string' || !motDePasse) {
          reponse.status(422).send('Le mot de passe ne doit pas être une chaîne vide');
        } else if (!utilisateur.accepteCGU() && !cguAcceptees) {
          reponse.status(422).send('CGU non acceptées');
        } else {
          depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse)
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

  routes.post('/autorisation', middleware.verificationAcceptationCGU, (requete, reponse, suite) => {
    const { emailContributeur, idHomologation } = requete.body;

    depotDonnees.utilisateurAvecEmail(emailContributeur)
      .then((u) => depotDonnees.ajouteContributeurAHomologation(u?.id, idHomologation))
      .then(() => reponse.send(''))
      .catch((e) => {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      });
  });

  return routes;
};

module.exports = routesApi;

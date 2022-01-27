const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurModele } = require('./erreurs');
const routesApiHomologation = require('./routes/routesApiHomologation');
const routesHomologation = require('./routes/routesHomologation');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware, referentiel, adaptateurMail,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

  const sersFormulaireEditionUtilisateur = (requete, reponse) => {
    middleware.verificationJWT(requete, reponse, () => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => reponse.render('utilisateur/edition', { utilisateur }));
    });
  };

  const app = express();

  app.use(express.json());
  app.use(cookieSession({
    maxAge: 30 * 60 * 1000,
    name: 'token',
    sameSite: true,
    secret: process.env.SECRET_COOKIE,
    secure: avecCookieSecurise,
  }));

  app.use(middleware.positionneHeaders);
  app.use(middleware.repousseExpirationCookie);

  app.disable('x-powered-by');

  app.set('trust proxy', 1);
  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.get('/', (requete, reponse) => {
    reponse.render('index');
  });

  app.get('/aPropos', (requete, reponse) => {
    reponse.render('aPropos');
  });

  app.get('/cgu', (requete, reponse) => {
    reponse.render('cgu');
  });

  app.get('/confidentialite', (requete, reponse) => {
    reponse.render('confidentialite');
  });

  app.get('/connexion', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('connexion');
  });

  app.get('/questionsFrequentes', (requete, reponse) => {
    reponse.render('questionsFrequentes');
  });

  app.get('/mentionsLegales', (requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  app.get('/reinitialisationMotDePasse', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('reinitialisationMotDePasse');
  });

  app.get('/inscription', (requete, reponse) => {
    reponse.render('inscription');
  });

  app.get('/initialisationMotDePasse/:idReset',
    middleware.aseptise('idReset'),
    (requete, reponse) => {
      const { idReset } = requete.params;
      depotDonnees.utilisateurAFinaliser(idReset)
        .then((utilisateur) => {
          if (!utilisateur) {
            reponse.status(404)
              .send(`Identifiant d'initialisation de mot de passe "${idReset}" inconnu`);
          } else {
            const token = utilisateur.genereToken();
            requete.session.token = token;
            sersFormulaireEditionUtilisateur(requete, reponse);
          }
        });
    });

  app.get('/admin/inscription', middleware.authentificationBasique, (requete, reponse) => {
    reponse.render('admin/inscription');
  });

  app.get('/espacePersonnel', middleware.verificationAcceptationCGU, (requete, reponse) => {
    reponse.render('espacePersonnel');
  });

  app.use('/homologation', routesHomologation(middleware, referentiel));

  app.get('/utilisateur/edition', (requete, reponse) => {
    sersFormulaireEditionUtilisateur(requete, reponse);
  });

  app.get('/api/homologations', middleware.verificationAcceptationCGU, (requete, reponse) => {
    depotDonnees.homologations(requete.idUtilisateurCourant)
      .then((homologations) => homologations.map((h) => h.toJSON()))
      .then((homologations) => reponse.json({ homologations }));
  });

  app.use('/api/homologation', routesApiHomologation(middleware, depotDonnees, referentiel));

  app.get('/api/seuilCriticite', middleware.verificationAcceptationCGU, (requete, reponse) => {
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

  app.post('/api/utilisateur', middleware.aseptise('prenom', 'nom', 'email'), (requete, reponse, suite) => {
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

  app.post('/api/reinitialisationMotDePasse', (requete, reponse, suite) => {
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

  app.put('/api/utilisateur', middleware.verificationJWT, (requete, reponse, suite) => {
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

  app.get('/api/utilisateurCourant', middleware.verificationJWT, (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => {
          reponse.json({ utilisateur: utilisateur.toJSON() });
        });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  app.post('/api/token', (requete, reponse, suite) => {
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

  app.use('/statique', express.static('public'));

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };

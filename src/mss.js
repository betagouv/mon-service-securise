const cookieSession = require('cookie-session');
const express = require('express');
const fs = require('fs');
const pdflatex = require('node-pdflatex').default;

const { DUREE_SESSION } = require('./configurationServeur');
const routesApi = require('./routes/routesApi');
const routesBibliotheques = require('./routes/routesBibliotheques');
const routesHomologation = require('./routes/routesHomologation');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware, referentiel, moteurRegles,
  adaptateurEquations, adaptateurMail,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

  const sersFormulaireEditionUtilisateur = (requete, reponse) => {
    const departements = referentiel.departements();
    middleware.verificationJWT(requete, reponse, () => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => reponse.render('utilisateur/edition', { utilisateur, departements }));
    });
  };

  const app = express();

  app.use(express.json());

  app.use(cookieSession({
    maxAge: DUREE_SESSION,
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

  app.get('/', (_requete, reponse) => {
    reponse.render('index');
  });

  app.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  app.get('/cgu', (_requete, reponse) => {
    reponse.render('cgu');
  });

  app.get('/confidentialite', (_requete, reponse) => {
    reponse.render('confidentialite');
  });

  app.get('/connexion', middleware.suppressionCookie, (_requete, reponse) => {
    reponse.render('connexion');
  });

  app.get('/questionsFrequentes', (_requete, reponse) => {
    adaptateurEquations.indiceSecurite()
      .then((svg) => reponse.render('questionsFrequentes', { formuleIndiceSecurite: svg }));
  });

  app.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  app.get('/nouvellesFonctionnalites', (_requete, reponse) => {
    reponse.render('nouvellesFonctionnalites');
  });

  app.get('/statistiques', (_requete, reponse) => {
    reponse.render('statistiques');
  });

  app.get('/reinitialisationMotDePasse', middleware.suppressionCookie, (_requete, reponse) => {
    reponse.render('reinitialisationMotDePasse');
  });

  app.get('/inscription', (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('inscription', { departements });
  });

  app.get('/activation', (_requete, reponse) => {
    reponse.render('activation');
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

  app.get('/admin/inscription', middleware.authentificationBasique, (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('admin/inscription', { departements });
  });

  app.get('/espacePersonnel', middleware.verificationAcceptationCGU, (_requete, reponse) => {
    reponse.render('espacePersonnel');
  });

  app.get('/decisionHomologation.pdf', (_requete, reponse, suite) => {
    fs.readFile('src/vuesTex/decisionHomologation.tex', (_erreurs, donnees) => {
      const avecCheminAbsolu = donnees.toString().replace(/__CHEMIN_BASE_ABSOLU__/g, process.env.CHEMIN_BASE_ABSOLU);
      pdflatex(avecCheminAbsolu)
        .then((pdf) => {
          reponse.contentType('application/pdf');
          reponse.send(pdf);
        })
        .catch(suite);
    });
  });

  app.use('/homologation', routesHomologation(middleware, referentiel, moteurRegles));

  app.use('/api', routesApi(middleware, adaptateurMail, depotDonnees, referentiel));

  app.use('/bibliotheques', routesBibliotheques());

  app.use('/homologation', routesHomologation(middleware, referentiel, moteurRegles));

  app.get('/utilisateur/edition', (requete, reponse) => {
    sersFormulaireEditionUtilisateur(requete, reponse);
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

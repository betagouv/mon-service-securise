const cookieSession = require('cookie-session');
const express = require('express');

const { DUREE_SESSION } = require('./http/configurationServeur');
const routesApi = require('./routes/routesApi');
const routesBibliotheques = require('./routes/routesBibliotheques');
const routesHomologation = require('./routes/routesHomologation');
const routesPdf = require('./routes/routesPdf');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware, referentiel, moteurRegles,
  adaptateurEnvironnement, adaptateurEquations, adaptateurMail, adaptateurPdf,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

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

  app.get('/motDePasse/edition', middleware.verificationJWT, (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    depotDonnees.utilisateur(idUtilisateur)
      .then((utilisateur) => reponse.render('motDePasse/edition', { utilisateur }));
  });

  app.get('/questionsFrequentes', (_requete, reponse) => {
    adaptateurEquations.indiceCyber()
      .then((svg) => reponse.render('questionsFrequentes', { formuleIndiceCyber: svg }));
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
            reponse.status(404).send(`Identifiant d'initialisation de mot de passe "${idReset}" inconnu`);
            return;
          }

          requete.session.token = utilisateur.genereToken();
          reponse.render('motDePasse/edition', { utilisateur });
        });
    });

  app.get('/admin/inscription', middleware.authentificationBasique, (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('admin/inscription', { departements });
  });

  app.get('/espacePersonnel', middleware.verificationAcceptationCGU, (_requete, reponse) => {
    reponse.render('espacePersonnel');
  });

  app.use('/api', routesApi(middleware, adaptateurMail, depotDonnees, referentiel));

  app.use('/bibliotheques', routesBibliotheques());

  app.use('/homologation', routesHomologation(middleware, referentiel, depotDonnees, moteurRegles, adaptateurEnvironnement));

  app.use('/pdf', routesPdf(middleware, adaptateurPdf));

  app.get('/utilisateur/edition', middleware.verificationJWT, (requete, reponse) => {
    const departements = referentiel.departements();
    const idUtilisateur = requete.idUtilisateurCourant;
    depotDonnees.utilisateur(idUtilisateur)
      .then((utilisateur) => reponse.render('utilisateur/edition', { utilisateur, departements }));
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

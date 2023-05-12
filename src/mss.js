const cookieSession = require('cookie-session');
const express = require('express');

const { DUREE_SESSION } = require('./http/configurationServeur');
const routesApi = require('./routes/routesApi');
const { routesBibliotheques } = require('./routes/routesBibliotheques');
const routesService = require('./routes/routesService');
const routesStyles = require('./routes/routesStyles');

require('dotenv').config();

const creeServeur = (
  depotDonnees,
  middleware,
  referentiel,
  moteurRegles,
  adaptateurMail,
  adaptateurPdf,
  adaptateurHorloge,
  adaptateurGestionErreur,
  adaptateurAnnuaire,
  adaptateurCsv,
  adaptateurZip,
  avecCookieSecurise = (process.env.NODE_ENV === 'production'),
  avecPageErreur = (process.env.NODE_ENV === 'production'),
) => {
  let serveur;

  const app = express();

  adaptateurGestionErreur.initialise();
  app.use(adaptateurGestionErreur.controleurRequetes());

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

  // Pour que les utilisateurs ayant cette page en favoris ne soient pas perdus.
  app.get('/questionsFrequentes', (_requete, reponse) => {
    reponse.redirect('https://aide.monservicesecurise.beta.gouv.fr');
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

  app.get('/tableauDeBord', middleware.verificationAcceptationCGU, (_requete, reponse) => {
    reponse.render('tableauDeBord');
  });

  app.use('/api', routesApi(middleware, adaptateurMail, depotDonnees, referentiel, adaptateurHorloge, adaptateurPdf, adaptateurAnnuaire, adaptateurCsv, adaptateurZip));

  app.use('/bibliotheques', routesBibliotheques());

  app.use('/service', routesService(middleware, referentiel, depotDonnees, moteurRegles));

  app.use('/styles', routesStyles());

  app.get('/utilisateur/edition', middleware.verificationJWT, (requete, reponse) => {
    const departements = referentiel.departements();
    const idUtilisateur = requete.idUtilisateurCourant;
    depotDonnees.utilisateur(idUtilisateur)
      .then((utilisateur) => reponse.render('utilisateur/edition', { utilisateur, departements }));
  });

  app.use('/statique', express.static('public'));

  app.use(adaptateurGestionErreur.controleurErreurs());

  if (avecPageErreur) {
    app.use((_erreur, _requete, reponse, _suite) => {
      reponse.render('erreur');
    });
  }

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };

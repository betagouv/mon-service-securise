const uuid = require('uuid');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const {
  CACHE_CONTROL_FICHIERS_STATIQUES,
  DUREE_SESSION,
  ENDPOINTS_SANS_CSRF,
} = require('./http/configurationServeur');
const routesApiPrivee = require('./routes/privees/routesApiPrivee');
const routesService = require('./routes/privees/routesService');
const routesApiPublique = require('./routes/publiques/routesApiPublique');
const {
  routesBibliotheques,
} = require('./routes/publiques/routesBibliotheques');
const routesStyles = require('./routes/publiques/routesStyles');

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
  serviceAnnuaire,
  adaptateurCsv,
  adaptateurZip,
  adaptateurTracking,
  adaptateurProtection,
  adaptateurJournalMSS,
  procedures,
  avecCookieSecurise = process.env.NODE_ENV === 'production',
  avecPageErreur = process.env.NODE_ENV === 'production'
) => {
  let serveur;

  const app = express();

  adaptateurGestionErreur.initialise(app);

  app.use(middleware.filtreIpAutorisees());

  app.use(express.json());

  app.use(
    cookieSession({
      maxAge: DUREE_SESSION,
      name: 'token',
      sameSite: true,
      secret: process.env.SECRET_COOKIE,
      secure: avecCookieSecurise,
    })
  );

  app.use(cookieParser());

  app.use(adaptateurProtection.protectionCsrf(ENDPOINTS_SANS_CSRF));
  app.use(adaptateurProtection.protectionLimiteTrafic());

  app.use(middleware.positionneHeaders);
  app.use(middleware.repousseExpirationCookie);

  app.disable('x-powered-by');

  app.set('trust proxy', 1);
  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  app.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  app.get('/securite', (_requete, reponse) => {
    reponse.render('securite');
  });

  app.get('/accessibilite', (_requete, reponse) => {
    reponse.render('accessibilite');
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

  app.get(
    '/motDePasse/edition',
    middleware.verificationJWT,
    (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) =>
        reponse.render('motDePasse/edition', {
          utilisateur,
          afficheChallengeMotDePasse: true,
        })
      );
    }
  );

  app.get(
    '/motDePasse/initialisation',
    middleware.verificationJWT,
    (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          reponse.render('motDePasse/edition', { utilisateur })
        );
    }
  );

  // Pour que les utilisateurs ayant cette page en favoris ne soient pas perdus.
  app.get('/questionsFrequentes', (_requete, reponse) => {
    reponse.redirect('https://aide.monservicesecurise.ssi.gouv.fr');
  });

  app.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  app.get('/statistiques', (_requete, reponse) => {
    reponse.render('statistiques');
  });

  app.get(
    '/reinitialisationMotDePasse',
    middleware.suppressionCookie,
    (_requete, reponse) => {
      reponse.render('reinitialisationMotDePasse');
    }
  );

  app.get('/inscription', (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('inscription', { departements });
  });

  app.get('/activation', (_requete, reponse) => {
    reponse.render('activation');
  });

  app.get(
    '/initialisationMotDePasse/:idReset',
    middleware.aseptise('idReset'),
    async (requete, reponse) => {
      const { idReset } = requete.params;

      const pasUnUUID = !uuid.validate(idReset);
      if (pasUnUUID) {
        reponse.status(400).send(`UUID requis`);
        return;
      }

      const utilisateur = await depotDonnees.utilisateurAFinaliser(idReset);
      if (!utilisateur) {
        reponse
          .status(404)
          .send(`Identifiant d'initialisation de mot de passe inconnu`);
        return;
      }

      requete.session.token = utilisateur.genereToken();
      reponse.render('motDePasse/edition', { utilisateur });
    }
  );

  app.get(
    '/espacePersonnel',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.redirect('tableauDeBord');
    }
  );

  app.get(
    '/tableauDeBord',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.render('tableauDeBord');
    }
  );

  app.get(
    '/historiqueProduit',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.render('historiqueProduit');
    }
  );

  app.use(
    '/api',
    routesApiPublique({
      middleware,
      referentiel,
      depotDonnees,
      serviceAnnuaire,
      adaptateurTracking,
      adaptateurMail,
    })
  );
  app.use('/bibliotheques', routesBibliotheques());
  app.use('/styles', routesStyles());

  app.use(
    '/api',
    middleware.verificationJWT,
    routesApiPrivee({
      middleware,
      adaptateurMail,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurCsv,
      adaptateurZip,
      adaptateurJournalMSS,
      procedures,
      serviceAnnuaire,
    })
  );

  app.use(
    '/service',
    middleware.verificationJWT,
    routesService({
      middleware,
      referentiel,
      depotDonnees,
      moteurRegles,
      adaptateurCsv,
      adaptateurGestionErreur,
      adaptateurHorloge,
    })
  );

  app.get(
    '/utilisateur/edition',
    middleware.verificationJWT,
    (requete, reponse) => {
      const departements = referentiel.departements();
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          reponse.render('utilisateur/edition', { utilisateur, departements })
        );
    }
  );

  app.use(
    '/statique',
    express.static('public', {
      setHeaders: (reponse) =>
        reponse.setHeader('cache-control', CACHE_CONTROL_FICHIERS_STATIQUES),
    })
  );

  app.use(adaptateurGestionErreur.controleurErreurs);

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

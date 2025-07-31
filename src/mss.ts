const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const express = require('express');

const {
  CACHE_CONTROL_FICHIERS_STATIQUES,
  ENDPOINTS_SANS_CSRF,
  TYPES_REQUETES,
} = require('./http/configurationServeur');
const routesConnecteApi = require('./routes/connecte/routesConnecteApi');
const routesNonConnecteApi = require('./routes/nonConnecte/routesNonConnecteApi');
const {
  routesNonConnecteApiBibliotheques,
} = require('./routes/nonConnecte/routesNonConnecteApiBibliotheques');
const routesNonConnecteApiStyles = require('./routes/nonConnecte/routesNonConnecteApiStyles');
const routesNonConnectePage = require('./routes/nonConnecte/routesNonConnectePage');
const routesConnectePage = require('./routes/connecte/routesConnectePage');
const routesNonConnecteOidc = require('./routes/nonConnecte/routesNonConnecteOidc');
const routesConnecteOidc = require('./routes/connecte/routesConnecteOidc');

require('dotenv').config();

const creeServeur = ({
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
  adaptateurJournal,
  adaptateurOidc,
  adaptateurEnvironnement,
  adaptateurStatistiques,
  adaptateurJWT,
  adaptateurProfilAnssi,
  adaptateurControleFichier,
  adaptateurXLS,
  busEvenements,
  cmsCrisp,
  serviceSupervision,
  serviceCgu,
  serviceGestionnaireSession,
  procedures,
  inscriptionUtilisateur,
  avecCookieSecurise = process.env.NODE_ENV === 'production',
  avecPageErreur = process.env.NODE_ENV === 'production',
}) => {
  let serveur;

  const app = express();

  adaptateurGestionErreur.initialise(app);

  app.use(middleware.filtreIpAutorisees());
  app.use(middleware.redirigeVersUrlBase);

  app.use(middleware.interdisLaMiseEnCache);

  app.use(express.json());

  app.use(
    cookieSession({
      name: 'session',
      sameSite: true,
      secret: process.env.SECRET_COOKIE,
      secure: avecCookieSecurise,
    })
  );

  app.use(cookieParser());

  app.use(adaptateurProtection.protectionCsrf(ENDPOINTS_SANS_CSRF));
  app.use(adaptateurProtection.protectionLimiteTrafic());

  app.use(middleware.positionneHeaders);
  app.use(middleware.ajouteVersionFichierCompiles);
  app.use(middleware.chargeFeatureFlags);

  app.disable('x-powered-by');

  app.set('trust proxy', adaptateurEnvironnement.trustProxy());
  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.use(/\/((?!statique).)*/, middleware.verificationModeMaintenance);

  app.use(
    '',
    middleware.chargeTypeRequete(TYPES_REQUETES.NAVIGATION),
    routesNonConnectePage({
      adaptateurEnvironnement,
      adaptateurStatistiques,
      adaptateurJWT,
      adaptateurProfilAnssi,
      cmsCrisp,
      serviceAnnuaire,
      depotDonnees,
      middleware,
      referentiel,
      serviceGestionnaireSession,
    })
  );
  app.use(
    '',
    middleware.chargeTypeRequete(TYPES_REQUETES.NAVIGATION),
    routesConnectePage({
      depotDonnees,
      middleware,
      moteurRegles,
      referentiel,
      adaptateurCsv,
      adaptateurGestionErreur,
      adaptateurHorloge,
    })
  );
  app.use(
    '/api',
    middleware.chargeTypeRequete(TYPES_REQUETES.API),
    routesNonConnecteApi({
      middleware,
      referentiel,
      depotDonnees,
      serviceAnnuaire,
      adaptateurTracking,
      adaptateurGestionErreur,
      adaptateurJWT,
      adaptateurMail,
      inscriptionUtilisateur,
      serviceCgu,
      serviceGestionnaireSession,
    })
  );
  app.use(
    '/oidc',
    middleware.chargeTypeRequete(TYPES_REQUETES.NAVIGATION),
    routesNonConnecteOidc({
      adaptateurOidc,
      adaptateurJWT,
      depotDonnees,
      middleware,
      adaptateurEnvironnement,
      serviceGestionnaireSession,
      adaptateurProfilAnssi,
      serviceAnnuaire,
    })
  );
  app.use(
    '/oidc',
    middleware.chargeTypeRequete(TYPES_REQUETES.NAVIGATION),
    routesConnecteOidc({
      middleware,
      adaptateurOidc,
    })
  );
  app.use(
    '/api',
    middleware.chargeTypeRequete(TYPES_REQUETES.API),
    middleware.verificationJWT,
    routesConnecteApi({
      middleware,
      adaptateurMail,
      busEvenements,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurCsv,
      adaptateurZip,
      adaptateurJournal,
      adaptateurControleFichier,
      adaptateurXLS,
      adaptateurJWT,
      procedures,
      serviceAnnuaire,
      serviceGestionnaireSession,
      serviceSupervision,
      serviceCgu,
    })
  );
  app.use(
    '/bibliotheques',
    middleware.chargeTypeRequete(TYPES_REQUETES.RESSOURCE),
    routesNonConnecteApiBibliotheques()
  );
  app.use(
    '/styles',
    middleware.chargeTypeRequete(TYPES_REQUETES.RESSOURCE),
    routesNonConnecteApiStyles()
  );

  app.use(
    '/statique',
    express.static('public', {
      setHeaders: (reponse) =>
        reponse.setHeader('cache-control', CACHE_CONTROL_FICHIERS_STATIQUES),
    })
  );

  app.use((_requete, reponse) => {
    reponse.status(404).render('404');
  });

  app.use(adaptateurGestionErreur.controleurErreurs);

  if (avecPageErreur) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((erreur, _requete, reponse, suite) => {
      if (erreur.message === 'CSRF token mismatch') {
        return suite(erreur);
      }
      return reponse.render('erreur', { idSentry: reponse.sentry });
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

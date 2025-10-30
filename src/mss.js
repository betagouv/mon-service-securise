import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import {
  CACHE_CONTROL_FICHIERS_STATIQUES,
  ENDPOINTS_SANS_CSRF,
  TYPES_REQUETES,
} from './http/configurationServeur.js';
import routesConnecteApi from './routes/connecte/routesConnecteApi.js';
import routesNonConnecteApi from './routes/nonConnecte/routesNonConnecteApi.js';
import { routesNonConnecteApiBibliotheques } from './routes/nonConnecte/routesNonConnecteApiBibliotheques.js';
import routesNonConnecteApiStyles from './routes/nonConnecte/routesNonConnecteApiStyles.js';
import routesNonConnectePage from './routes/nonConnecte/routesNonConnectePage.js';
import routesConnectePage from './routes/connecte/routesConnectePage.js';
import routesNonConnecteOidc from './routes/nonConnecte/routesNonConnecteOidc.js';
import routesConnecteOidc from './routes/connecte/routesConnecteOidc.js';
import { ajouteHtmlEntitiesEncode } from './http/encodeEntitesHTML.js';

dotenv.config();

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
  adaptateurProtection,
  adaptateurJournal,
  adaptateurOidc,
  adaptateurEnvironnement,
  adaptateurStatistiques,
  adaptateurJWT,
  adaptateurProfilAnssi,
  lecteurDeFormData,
  adaptateurTeleversementServices,
  adaptateurTeleversementModelesMesureSpecifique,
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
  ajouteHtmlEntitiesEncode(app);

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
      cmsCrisp,
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
      lecteurDeFormData,
      adaptateurTeleversementServices,
      adaptateurTeleversementModelesMesureSpecifique,
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

  return { ecoute, arreteEcoute, app };
};

export { creeServeur };

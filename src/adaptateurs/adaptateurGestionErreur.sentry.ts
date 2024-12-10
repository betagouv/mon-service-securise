import Express = require('express');
import adaptateurEnvironnement = require('./adaptateurEnvironnement');
import AdaptateurGestionErreur = require('./adaptateurGestionErreur.interface');

const Sentry = require('@sentry/node');
const { IpDeniedError } = require('express-ipfilter');

const logueErreur = (
  erreur: Error,
  infosDeContexte: Record<string, string> = {}
) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );
    Sentry.captureException(erreur);
  });
};

const initialise = (applicationExpress: Express.Application) => {
  const config = adaptateurEnvironnement.sentry();

  Sentry.init({
    dsn: config.dsn(),
    environment: config.environnement(),
    integrations: [
      new Sentry.Integrations.Express({ app: applicationExpress }),
      new Sentry.Integrations.Postgres(),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    ignoreTransactions: config.cheminsIgnoresParTracing(),
    tracesSampleRate: config.sampleRateDuTracing(),
  });

  applicationExpress.use(Sentry.Handlers.requestHandler());
  applicationExpress.use(Sentry.Handlers.tracingHandler());
};

const controleurErreurs = (
  erreur: Error,
  requete: Express.Request,
  reponse: Express.Response,
  suite: Express.NextFunction
) => {
  const estErreurDeFiltrageIp = erreur instanceof IpDeniedError;
  if (estErreurDeFiltrageIp) {
    // On termine la connexion directement si qqun nous appelle sans passer par Baleen.
    reponse.end();
    return suite();
  }
  const estErreurCSRF = erreur.message === 'CSRF token mismatch';
  if (estErreurCSRF) {
    logueErreur(new Error('Une erreur CSRF mismatch a été détectée'), {
      'Token CSRF du client': requete.headers['x-csrf-token'] as string,
    });
  }

  if (requete && requete.body) {
    Object.keys(requete.body).forEach((cle) => {
      // eslint-disable-next-line no-param-reassign
      if (cle.includes('motDePasse')) requete.body[cle] = '********';
    });
  }

  return Sentry.Handlers.errorHandler()(erreur, requete, reponse, suite);
};

const adaptateurGestionErreurSentry: AdaptateurGestionErreur = {
  initialise,
  controleurErreurs,
  logueErreur,
};

module.exports = adaptateurGestionErreurSentry;

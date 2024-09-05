const Sentry = require('@sentry/node');
const { IpDeniedError } = require('express-ipfilter');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const { extraisIp } = require('../http/requeteHttp');

const logueErreur = (erreur, infosDeContexte = {}) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );
    Sentry.captureException(erreur);
  });
};

const initialise = (applicationExpress) => {
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

const controleurErreurs = (erreur, requete, reponse, suite) => {
  const estErreurDeFiltrageIp = erreur instanceof IpDeniedError;
  if (estErreurDeFiltrageIp) {
    const ipDuClient = extraisIp(requete.headers).client;

    logueErreur(
      new Error(
        'Une IP non autorisée a été bloquée. Aucune page ne lui a été servie.'
      ),
      { 'IP du client': ipDuClient?.replaceAll('.', '*') }
    );
    reponse.end();
    return suite();
  }
  const estErreurCSRF = erreur.message === 'CSRF token mismatch';
  if (estErreurCSRF) {
    logueErreur(new Error('Une erreur CSRF mismatch a été détectée'), {
      'Token CSRF du client': requete.headers['x-csrf-token'],
    });
  }

  if (requete && requete.body) {
    Object.keys(requete.body).forEach((cle) => {
      if (cle.includes('motDePasse')) requete.body[cle] = '********';
    });
  }

  return Sentry.Handlers.errorHandler()(erreur, requete, reponse, suite);
};

module.exports = {
  initialise,
  controleurErreurs,
  logueErreur,
};

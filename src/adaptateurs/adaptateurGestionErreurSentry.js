const Sentry = require('@sentry/node');
const { IpDeniedError } = require('express-ipfilter');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const logueErreur = (erreur, infosDeContexte = {}) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );
    Sentry.captureException(erreur);
  });
};

const initialise = (applicationExpress) => {
  Sentry.init({
    dsn: adaptateurEnvironnement.sentry().dsn(),
    environment: adaptateurEnvironnement.sentry().environnement(),
    integrations: [
      new Sentry.Integrations.Express({ app: applicationExpress }),
      new Sentry.Integrations.Postgres(),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    ignoreTransactions: ['/statique/'],
    tracesSampleRate: 1.0,
  });

  applicationExpress.use(Sentry.Handlers.requestHandler());
  applicationExpress.use(Sentry.Handlers.tracingHandler());
};

const controleurErreurs = (erreur, requete, reponse, suite) => {
  const estErreurDeFiltrageIp = erreur instanceof IpDeniedError;
  if (estErreurDeFiltrageIp) {
    logueErreur(
      new Error(
        'Une IP non autorisée a été bloquée. Aucune page ne lui a été servie.'
      ),
      { 'IP de la requete': requete.headers['x-real-ip']?.replaceAll('.', '*') }
    );
    reponse.end();
    return suite();
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

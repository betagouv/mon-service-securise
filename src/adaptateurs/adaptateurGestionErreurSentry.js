const { isAxiosError } = require('axios');
const Sentry = require('@sentry/node');
const { IpDeniedError } = require('express-ipfilter');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const logueErreur = (erreur, infosDeContexte = {}) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );

    if (isAxiosError(erreur)) {
      Sentry.captureException(erreur, {
        extra: {
          message: erreur.message,
          name: erreur.name,
          code: erreur.code,
          response: {
            status: erreur.response?.status,
            headers: erreur.response?.headers,
            data: erreur.response?.data,
          },
          request: {
            method: erreur.request?.method,
            body: erreur.request?.body,
            path: erreur.request?.path,
            protocol: erreur.request?.protocol,
          },
        },
      });
      return;
    }

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
  Sentry.setTag('mss-source', 'backend');

  applicationExpress.use(Sentry.Handlers.requestHandler());
  applicationExpress.use(Sentry.Handlers.tracingHandler());
};

const controleurErreurs = (erreur, requete, reponse, suite) => {
  const estErreurDeFiltrageIp = erreur instanceof IpDeniedError;
  if (estErreurDeFiltrageIp) {
    // On termine la connexion directement si qqun nous appelle sans passer par Baleen.
    reponse.status(401);
    reponse.end();
    return;
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

  Sentry.Handlers.errorHandler()(erreur, requete, reponse, suite);
};

const identifieUtilisateur = (idUtilisateur, timestampTokenJwt) => {
  Sentry.setUser({
    id: idUtilisateur,
    'Connexion UTC': new Date(timestampTokenJwt * 1_000),
  });
};

module.exports = {
  initialise,
  identifieUtilisateur,
  controleurErreurs,
  logueErreur,
};

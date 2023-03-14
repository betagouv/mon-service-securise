const Sentry = require('@sentry/node');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const initialise = () => {
  Sentry.init({
    dsn: adaptateurEnvironnement.sentry().dsn(),
    environment: adaptateurEnvironnement.sentry().environnement(),
  });
};

const controleurRequetes = () => Sentry.Handlers.requestHandler();

const controleurErreurs = () => Sentry.Handlers.errorHandler();

module.exports = { initialise, controleurRequetes, controleurErreurs };

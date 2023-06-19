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

const logueErreur = (erreur, infosDeContexte = {}) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );
    Sentry.captureException(erreur);
  });
};

module.exports = {
  initialise,
  controleurRequetes,
  controleurErreurs,
  logueErreur,
};

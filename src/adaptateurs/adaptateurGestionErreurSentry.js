const Sentry = require('@sentry/node');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const initialise = () => {
  Sentry.init({
    dsn: adaptateurEnvironnement.sentry().dsn(),
    environment: adaptateurEnvironnement.sentry().environnement(),
  });
};

const controleurRequetes = () => Sentry.Handlers.requestHandler();

const controleurErreurs = (erreur, requete, reponse, suite) => {
  if (requete && requete.body) {
    Object.keys(requete.body).forEach((cle) => {
      if (cle.includes('motDePasse')) requete.body[cle] = '********';
    });
  }

  return Sentry.Handlers.errorHandler()(erreur, requete, reponse, suite);
};

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

const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurSentry = require('./adaptateurGestionErreurSentry');
const adaptateurVide = require('./adaptateurGestionErreurVide');

const fabriqueAdaptateurGestionErreur = () => (adaptateurEnvironnement.sentry().dsn()
  ? adaptateurSentry
  : adaptateurVide);

module.exports = { fabriqueAdaptateurGestionErreur };

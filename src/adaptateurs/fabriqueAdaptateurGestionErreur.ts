import AdaptateurGestionErreur = require('./adaptateurGestionErreur.interface');

const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurSentry = require('./adaptateurGestionErreur.sentry');
const adaptateurVide = require('./adaptateurGestionErreur.vide');

const fabriqueAdaptateurGestionErreur = (): AdaptateurGestionErreur =>
  adaptateurEnvironnement.sentry().dsn() ? adaptateurSentry : adaptateurVide;

module.exports = { fabriqueAdaptateurGestionErreur };

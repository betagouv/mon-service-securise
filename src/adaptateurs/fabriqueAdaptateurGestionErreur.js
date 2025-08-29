const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurSentry = require('./adaptateurGestionErreurSentry');
const {
  fabriqueAdaptateurGestionErreurVide,
} = require('./adaptateurGestionErreurVide');

const fabriqueAdaptateurGestionErreur = () =>
  adaptateurEnvironnement.sentry().dsn()
    ? adaptateurSentry
    : fabriqueAdaptateurGestionErreurVide();

module.exports = { fabriqueAdaptateurGestionErreur };

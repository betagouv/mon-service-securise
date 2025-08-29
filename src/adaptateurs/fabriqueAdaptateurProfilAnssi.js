const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurProfilAnssi = require('./adaptateurProfilAnssi');
const {
  fabriqueAdaptateurProfilAnssiVide,
} = require('./adaptateurProfilAnssiVide');

const fabriqueAdaptateurProfilAnssi = () =>
  adaptateurEnvironnement.featureFlag().avecServiceMonProfilAnssi()
    ? adaptateurProfilAnssi
    : fabriqueAdaptateurProfilAnssiVide();

module.exports = { fabriqueAdaptateurProfilAnssi };

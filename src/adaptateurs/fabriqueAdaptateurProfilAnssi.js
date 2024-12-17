const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurProfilAnssi = require('./adaptateurProfilAnssi');
const adaptateurProfilAnssiVide = require('./adaptateurProfilAnssiVide');

const fabriqueAdaptateurProfilAnssi = () =>
  adaptateurEnvironnement.featureFlag().avecServiceMonProfilAnssi()
    ? adaptateurProfilAnssi
    : adaptateurProfilAnssiVide;

module.exports = { fabriqueAdaptateurProfilAnssi };

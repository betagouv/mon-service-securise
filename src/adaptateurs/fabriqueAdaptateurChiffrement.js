const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurChiffrementPassePlat = require('./adaptateurChiffrement');
const {
  adaptateurChiffrementChaCha20,
} = require('./adaptateurChiffrementChaCha20');

const fabriqueAdaptateurChiffrement = () => {
  if (adaptateurEnvironnement.chiffrement().utiliseChiffrementChaCha20())
    return adaptateurChiffrementChaCha20({ adaptateurEnvironnement });

  return adaptateurChiffrementPassePlat;
};
module.exports = { fabriqueAdaptateurChiffrement };

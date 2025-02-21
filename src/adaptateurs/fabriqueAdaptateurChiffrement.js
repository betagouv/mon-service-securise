const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const {
  adaptateurChiffrementChaCha20,
} = require('./adaptateurChiffrementChaCha20');
const { adaptateurChiffrement } = require('./adaptateurChiffrement');

const fabriqueAdaptateurChiffrement = () => {
  if (adaptateurEnvironnement.chiffrement().utiliseChiffrementChaCha20())
    return adaptateurChiffrementChaCha20({ adaptateurEnvironnement });

  return adaptateurChiffrement({ adaptateurEnvironnement });
};
module.exports = { fabriqueAdaptateurChiffrement };

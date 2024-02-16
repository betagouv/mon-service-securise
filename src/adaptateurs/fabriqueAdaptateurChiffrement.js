const { chiffrement } = require('./adaptateurEnvironnement');
const adaptateurChiffrement = require('./adaptateurChiffrement');

const fabriqueAdaptateurChiffrement = () => {
  if (chiffrement().utiliseChiffrementVault()) return adaptateurChiffrement;
  return adaptateurChiffrement;
};

module.exports = { fabriqueAdaptateurChiffrement };

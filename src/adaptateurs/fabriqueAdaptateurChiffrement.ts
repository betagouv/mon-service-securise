const { chiffrement } = require('./adaptateurEnvironnement');
const adaptateurChiffrement = require('./adaptateurChiffrement');
const adaptateurChiffrementVault = require('./adaptateurChiffrementVault');

const fabriqueAdaptateurChiffrement = () => {
  if (chiffrement().utiliseChiffrementVault())
    return adaptateurChiffrementVault;

  return adaptateurChiffrement;
};

module.exports = { fabriqueAdaptateurChiffrement };

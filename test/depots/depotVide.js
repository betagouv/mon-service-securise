const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

const fabriqueAdaptateurPersistance = require('../../src/adaptateurs/fabriqueAdaptateurPersistance');
const DepotDonnees = require('../../src/depotDonnees');

const depotVide = (config = {
  adaptateurChiffrement: fauxAdaptateurChiffrement,
  adaptateurPersistance: fabriqueAdaptateurPersistance(),
}) => {
  const { adaptateurPersistance } = config;
  return adaptateurPersistance.supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeHomologations())
    .then(() => adaptateurPersistance.supprimeAutorisations())
    .then(() => DepotDonnees.creeDepot(config));
};

module.exports = { depotVide };

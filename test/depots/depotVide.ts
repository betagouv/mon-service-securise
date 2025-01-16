const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

const fabriqueAdaptateurPersistance = require('../../src/adaptateurs/fabriqueAdaptateurPersistance');
const DepotDonnees = require('../../src/depotDonnees');

const depotVide = (
  config = {
    adaptateurChiffrement: fauxAdaptateurChiffrement(),
    adaptateurPersistance: fabriqueAdaptateurPersistance(),
    adaptateurEnvironnement: {},
    serviceCgu: { versionActuelle: () => 'v-Vide' },
  }
) => {
  const { adaptateurPersistance } = config;
  return adaptateurPersistance
    .supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeServices())
    .then(() => adaptateurPersistance.supprimeAutorisations())
    .then(() => DepotDonnees.creeDepot(config));
};

module.exports = { depotVide };

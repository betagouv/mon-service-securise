import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fabriqueAdaptateurPersistance from '../../src/adaptateurs/fabriqueAdaptateurPersistance.js';
import * as DepotDonnees from '../../src/depotDonnees.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';

const depotVide = (
  config = {
    adaptateurChiffrement: fauxAdaptateurChiffrement(),
    adaptateurPersistance: fabriqueAdaptateurPersistance(),
    adaptateurEnvironnement: {},
    serviceCgu: { versionActuelle: () => 'v-Vide' },
    busEvenements: fabriqueBusPourLesTests(),
  }
) => {
  const { adaptateurPersistance } = config;
  return adaptateurPersistance
    .supprimeUtilisateurs()
    .then(() => adaptateurPersistance.supprimeServices())
    .then(() => adaptateurPersistance.supprimeAutorisations())
    .then(() => DepotDonnees.creeDepot(config));
};

export { depotVide };

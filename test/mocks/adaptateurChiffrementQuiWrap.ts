import {
  AdaptateurChiffrement,
  Stringifiable,
} from '../../src/adaptateurs/adaptateurChiffrement.interface.js';
import fauxAdaptateurChiffrement from './adaptateurChiffrement.js';
import { DonneesChiffrees } from '../../src/typesBasiques.js';

function unAdaptateurChiffrementQuiWrap(): AdaptateurChiffrement {
  const faux = fauxAdaptateurChiffrement();

  return {
    ...faux,
    chiffre: async (donnees: Stringifiable) => ({
      coffreFort: donnees,
      chiffre: true,
    }),
    dechiffre: async (objetChiffre: DonneesChiffrees) => {
      if (typeof objetChiffre === 'string')
        throw new Error(
          `Le paramètre n'a pas été chiffré par cette implémentation. ${objetChiffre}`
        );

      return objetChiffre.coffreFort as never;
    },
  };
}

export { unAdaptateurChiffrementQuiWrap };

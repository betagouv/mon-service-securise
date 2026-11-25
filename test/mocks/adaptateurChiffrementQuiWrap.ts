import {
  AdaptateurChiffrement,
  Stringifiable,
} from '../../src/adaptateurs/adaptateurChiffrement.interface.js';
import fauxAdaptateurChiffrement from './adaptateurChiffrement.js';
import { DonneesChiffrees } from '../../src/typesBasiques.js';

type DonneesDansCoffreFort = { coffreFort: Stringifiable; chiffre: true };

function unAdaptateurChiffrementQuiWrap(): AdaptateurChiffrement {
  const faux = fauxAdaptateurChiffrement();

  return {
    ...faux,
    chiffre: async (donnees: Stringifiable) =>
      ({
        coffreFort: donnees,
        chiffre: true,
      }) as DonneesDansCoffreFort as unknown as DonneesChiffrees,
    dechiffre: async (objetChiffre: DonneesChiffrees) => {
      if (typeof objetChiffre === 'string')
        throw new Error(
          `Le paramètre n'a pas été chiffré par cette implémentation. ${objetChiffre}`
        );

      return (objetChiffre as unknown as DonneesDansCoffreFort)
        .coffreFort as never;
    },
  };
}

export { unAdaptateurChiffrementQuiWrap };

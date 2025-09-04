import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import {
  AdaptateurChiffrement,
  ChaineOuObjet,
} from './adaptateurChiffrement.interface.js';
import { DonneesChiffrees } from '../typesBasiques.js';

type ConfigurationChiffrement = {
  chiffrement: () => {
    tousLesSelsDeHachage: () => { sel: string; version: number }[];
  };
};

const adaptateurChiffrement = ({
  adaptateurEnvironnement,
}: {
  adaptateurEnvironnement: ConfigurationChiffrement;
}): AdaptateurChiffrement => {
  const NOMBRE_DE_PASSES = 10;

  const hacheBCrypt = (chaineEnClair: string) =>
    bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

  const hacheSha256AvecUnSeulSel = (chaine: string, sel: string) =>
    createHash('sha256')
      .update(chaine + sel)
      .digest('hex');

  return {
    chiffre: async (chaineOuObjet: ChaineOuObjet) =>
      chaineOuObjet as DonneesChiffrees,

    dechiffre: async <T>(chaineChiffree: DonneesChiffrees) =>
      chaineChiffree as T,

    hacheBCrypt,

    compareBCrypt: bcrypt.compare,

    hacheSha256AvecUnSeulSel,

    hacheSha256: (chaineEnClair: string) => {
      const tousLesSelsDeHachage = adaptateurEnvironnement
        .chiffrement()
        .tousLesSelsDeHachage();

      const hashFinal = tousLesSelsDeHachage.reduce(
        (acc, { sel }) => hacheSha256AvecUnSeulSel(acc, sel),
        chaineEnClair
      );

      const version = tousLesSelsDeHachage
        .map(({ version: numVersion }) => `v${numVersion}`)
        .join('-');

      return `${version}:${hashFinal}`;
    },

    nonce: () => randomBytes(16).toString('base64'),
  };
};

export { adaptateurChiffrement };

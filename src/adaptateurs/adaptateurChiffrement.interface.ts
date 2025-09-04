import { DonneesChiffrees } from '../typesBasiques.js';

export type ChaineOuObjet = string | Record<string, unknown>;

export type AdaptateurChiffrement = {
  chiffre: (chaineOuObjet: ChaineOuObjet) => Promise<DonneesChiffrees>;
  dechiffre: <T>(chaineChiffree: DonneesChiffrees) => Promise<T>;
  hacheBCrypt: (chaineEnClair: string) => Promise<string>;
  compareBCrypt: (
    chaineEnClair: string,
    chaineChiffree: string
  ) => Promise<boolean>;
  hacheSha256AvecUnSeulSel: (chaineEnClair: string, sel: string) => string;
  hacheSha256: (chaineEnClair: string) => string;
  nonce: () => string;
};

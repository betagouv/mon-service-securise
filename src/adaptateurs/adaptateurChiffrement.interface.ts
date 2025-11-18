import { DonneesChiffrees } from '../typesBasiques.js';

export type Stringifiable = string | Record<string, unknown> | Array<unknown>;

export type AdaptateurChiffrement = {
  chiffre: (chose: Stringifiable) => Promise<DonneesChiffrees>;
  dechiffre: <T>(chaineChiffree: DonneesChiffrees) => Promise<T>;
  hacheBCrypt: (chaineEnClair: string) => Promise<string>;
  compareBCrypt: (
    chaineEnClair: string,
    chaineChiffree: string
  ) => Promise<boolean>;
  hacheSha256: (chaineEnClair: string) => string;
  nonce: () => string;
};

export type AdaptateurEnvironnementPourChiffrement = {
  chiffrement: () => {
    tousLesSelsDeHachage: () => { sel: string; version: number }[];
  };
};

export type AdaptateurEnvironnementPourChiffrementChaCha20 = {
  chiffrement: () => {
    tousLesSelsDeHachage: () => { sel: string; version: number }[];
    cleChaCha20Hex: () => string;
  };
};

import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.js';

const hacheEnMajuscules: Pick<AdaptateurChiffrement, 'hacheSha256'> = {
  hacheSha256: (valeur: string) => valeur?.toUpperCase(),
};

export { hacheEnMajuscules };

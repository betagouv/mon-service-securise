import { ModificateurPourBesoin } from '../../../src/moteurRegles/v2/moteurReglesV2.js';

type AouIouR = 'A' | 'I' | 'R';

const parLettre: Record<AouIouR, ModificateurPourBesoin> = {
  I: 'Indispensable',
  R: 'Recommandée',
  A: 'Absente',
};

export const besoins = (
  acronyme: `${AouIouR}-${AouIouR}-${AouIouR}`
): {
  niveau1: ModificateurPourBesoin;
  niveau2: ModificateurPourBesoin;
  niveau3: ModificateurPourBesoin;
} => {
  const [niveau1, niveau2, niveau3] = acronyme.split('-') as AouIouR[];

  return {
    niveau1: parLettre[niveau1],
    niveau2: parLettre[niveau2],
    niveau3: parLettre[niveau3],
  };
};

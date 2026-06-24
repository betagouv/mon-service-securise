/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationPredicatVraisemblance,
  ConfigurationVraisemblancePourUnVecteur,
} from './vraisemblance.types.js';
import { siTout } from './vraisemblance.predicats.js';

export const V10: ConfigurationVraisemblancePourUnVecteur = {
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['PHYS.1'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 1, idsMesures: ['MCO_MCS.11', 'MCO_MCS.12'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        poidsA,
        poidsB,
        poidsC,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b) - poidsC * siTout(c),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['PHYS.1', 'PHYS.2'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 1, idsMesures: ['MCO_MCS.11', 'MCO_MCS.12'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        poidsA,
        poidsB,
        poidsC,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b) - poidsC * siTout(c),
    ],
  },
};

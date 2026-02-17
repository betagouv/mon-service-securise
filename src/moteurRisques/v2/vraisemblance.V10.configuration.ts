import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout } from './vraisemblance.predicats.js';

export const V10: ConfigurationVraisemblancePourUnVecteur = {
  niveau2: {
    groupes: {
      a: { poids: 2, idsMesures: ['PHYS.1'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 2, idsMesures: ['PHYS.1', 'PHYS.2'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
};

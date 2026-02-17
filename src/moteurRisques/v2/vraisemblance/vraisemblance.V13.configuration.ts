import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout } from './vraisemblance.predicats.js';

export const V13: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
};

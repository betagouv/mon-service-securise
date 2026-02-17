import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout } from './vraisemblance.predicats.js';

export const V12: ConfigurationVraisemblancePourUnVecteur = {
  niveau2: {
    groupes: {
      a: { poids: 2, idsMesures: ['FILTRE.4'] },
      b: { poids: 1, idsMesures: ['FILTRE.1'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 2, idsMesures: ['FILTRE.4'] },
      b: { poids: 1, idsMesures: ['CLOISON.4', 'FILTRE.1', 'FILTRE.2'] },
    },
    formules: [
      ({ a, b, poidsA, poidsB }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsB * siTout(b),
    ],
  },
};

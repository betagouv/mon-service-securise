import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout } from './vraisemblance.predicats.js';

export const V11: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: { c: { poids: 2, idsMesures: ['CONTRAT.1'] } },
    formules: [
      ({ c, poidsC }: ConfigurationPredicatVraisemblance) =>
        4 - poidsC * siTout(c),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 2, idsMesures: ['PHYS.1'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 2, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siTout(c),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 2, idsMesures: ['PHYS.1', 'PHYS.2'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 2, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siTout(c),
    ],
  },
};

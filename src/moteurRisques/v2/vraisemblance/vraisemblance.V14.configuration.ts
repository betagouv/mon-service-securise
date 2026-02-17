import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V14: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
      c: { poids: 1, idsMesures: ['CONTRAT.1'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siAucune(c),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
      c: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siPasTout(c),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6'] },
      c: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siPasTout(c),
    ],
  },
};

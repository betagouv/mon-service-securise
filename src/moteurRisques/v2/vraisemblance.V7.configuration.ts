import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siPasTout } from './vraisemblance.predicats.js';

export const V7: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: { poids: 1, idsMesures: ['DROITS.1', 'DROITS.3'] },
      d: { poids: 1, idsMesures: ['CONTRAT.1'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsB * siTout(b) +
        poidsC * siPasTout(c) +
        poidsD * siPasTout(d),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2', 'MAIL.1'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: [
          'RH.4',
          'AUTH.2',
          'AUTH.3',
          'AUTH.8',
          'DROITS.1',
          'DROITS.3',
        ],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsB * siTout(b) +
        poidsC * siPasTout(c) +
        poidsD * siPasTout(d),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2', 'MAIL.1'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: [
          'RH.4',
          'AUTH.2',
          'AUTH.3',
          'AUTH.8',
          'DROITS.1',
          'DROITS.3',
        ],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsB * siTout(b) +
        poidsC * siPasTout(c) +
        poidsD * siPasTout(d),
    ],
  },
};

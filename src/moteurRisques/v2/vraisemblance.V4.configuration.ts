import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune } from './vraisemblance.predicats.js';

export const V4: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: {
        poids: 2,
        idsMesures: ['MCO_MCS.15', 'MCO_MCS.5', 'MCO_MCS.6', 'AUTH.9'],
      },
      c: { poids: 1, idsMesures: ['AUDIT.6'] },
    },
    formules: [
      ({ a, c, poidsA, poidsC }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsC * siTout(c),
    ],
  },
  niveau2: {
    groupes: {
      a: {
        poids: 1,
        idsMesures: [
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
          'FILTRE.7',
          'AUTH.9',
          'CONFIG.1',
          'CONFIG.6',
        ],
      },
      c: { poids: 1, idsMesures: ['AUDIT.6'] },
      d: {
        poids: 1,
        idsMesures: [
          'CLOISON.1',
          'CLOISON.5',
          'FILTRE.1',
          'FILTRE.3',
          'FILTRE.5',
        ],
      },
    },
    formules: [
      ({
        a,
        c,
        d,
        poidsA,
        poidsC,
        poidsD,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsD * siTout(d) + poidsC * siAucune(c),
    ],
  },
  niveau3: {
    groupes: {
      a: {
        poids: 1,
        idsMesures: [
          'MCO_MCS.1',
          'MCO_MCS.17',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
          'FILTRE.7',
          'AUTH.9',
          'CONFIG.1',
          'CONFIG.2',
          'CONFIG.6',
        ],
      },
      b: { poids: 1, idsMesures: ['AUDIT.2', 'AUDIT.3', 'AUDIT.4', 'AUDIT.5'] },
      c: { poids: 1, idsMesures: ['AUDIT.6', 'CONFIG.3'] },
      d: {
        poids: 1,
        idsMesures: [
          'CLOISON.1',
          'CLOISON.2',
          'CLOISON.3',
          'CLOISON.4',
          'CLOISON.5',
          'CLOISON.6',
          'FILTRE.1',
          'FILTRE.2',
          'FILTRE.3',
          'FILTRE.5',
        ],
      },
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
        poidsD * siTout(d) +
        poidsC * siAucune(c) +
        poidsB * siAucune(b),
    ],
  },
};

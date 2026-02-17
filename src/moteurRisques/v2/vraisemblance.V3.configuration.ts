import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune } from './vraisemblance.predicats.js';

export const V3: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 2, idsMesures: ['MCO_MCS.14', 'MCO_MCS.5', 'MCO_MCS.6'] },
      g: { poids: 1, idsMesures: ['CONTRAT.1'] },
    },
    formules: [
      ({ a, g, poidsA, poidsG }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsG * siTout(g),
    ],
  },
  niveau2: {
    groupes: {
      a: {
        poids: 2,
        idsMesures: [
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
          'CONFIG.1',
        ],
      },
      g: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
    },
    formules: [
      ({ a, g, poidsA, poidsG }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsG * siTout(g) + poidsG * siAucune(g),
    ],
  },
  niveau3: {
    groupes: {
      a: {
        poids: 1,
        idsMesures: [
          'MCO_MCS.1',
          'MCO_MCS.14',
          'MCO_MCS.17',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
          'CONFIG.1',
          'CONFIG.2',
        ],
      },
      b: { poids: 2, idsMesures: ['CONFIG.3'] },
      c: { poids: 2, idsMesures: ['ADMIN.4'] },
      d: { poids: 1, idsMesures: ['ADMIN.1', 'ADMIN.3'] },
      e: { poids: 1, idsMesures: ['ADMIN.2', 'ADMIN.5'] },
      f: { poids: 1, idsMesures: ['ADMIN.6', 'ADMIN.7'] },
      g: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        g,
        poidsA,
        poidsB,
        poidsC,
        poidsG,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) -
        poidsG * siTout(g) +
        poidsG * siAucune(g) +
        poidsB * siAucune(b),
      ({
        d,
        e,
        f,
        g,
        poidsD,
        poidsE,
        poidsF,
        poidsG,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsD * siTout(d) -
        poidsE * siTout(e) -
        poidsF * siTout(f) +
        poidsG * siAucune(g),
    ],
  },
};

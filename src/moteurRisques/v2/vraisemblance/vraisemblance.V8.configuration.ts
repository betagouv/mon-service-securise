import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V8: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: {
        poids: 2,
        idsMesures: [
          'MALWARE.5',
          'MALWARE.6',
          'MCO_MCS.14',
          'MCO_MCS.15',
          'MCO_MCS.3',
          'MCO_MCS.5',
          'MCO_MCS.6',
        ],
      },
      c: { poids: 1, idsMesures: ['MCO_MCS.16'] },
      d: { poids: 1, idsMesures: ['CONTRAT.1'] },
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
        4 - poidsA * siTout(a) - poidsC * siTout(c) + poidsD * siAucune(d),
    ],
  },
  niveau2: {
    groupes: {
      a: {
        poids: 1,
        idsMesures: [
          'MALWARE.4',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
        ],
      },
      b: {
        poids: 1,
        idsMesures: [
          'CONFIG.1',
          'CONFIG.4',
          'CONFIG.5',
          'CONFIG.6',
          'CONFIG.8',
        ],
      },
      c: {
        poids: 1,
        idsMesures: ['CLOISON.1', 'CLOISON.5', 'FILTRE.1', 'FILTRE.3'],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
      f: { poids: 1, idsMesures: ['DISTANCE.1', 'DISTANCE.2', 'DISTANCE.3'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        f,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
        poidsF,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsB * siTout(b) -
        poidsC * siTout(c) +
        poidsD * siPasTout(d) -
        poidsF * siTout(f),
    ],
  },
  niveau3: {
    groupes: {
      a: {
        poids: 1,
        idsMesures: [
          'MCO_MCS.1',
          'MCO_MCS.17',
          'MALWARE.4',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
        ],
      },
      b: {
        poids: 1,
        idsMesures: [
          'CONFIG.1',
          'CONFIG.2',
          'CONFIG.4',
          'CONFIG.5',
          'CONFIG.6',
          'CONFIG.8',
        ],
      },
      c: {
        poids: 1,
        idsMesures: [
          'CLOISON.1',
          'CLOISON.2',
          'CLOISON.5',
          'CLOISON.6',
          'FILTRE.1',
          'FILTRE.2',
          'FILTRE.3',
        ],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2'] },
      e: { poids: 1, idsMesures: ['CONFIG.3'] },
      f: { poids: 1, idsMesures: ['DISTANCE.1', 'DISTANCE.2', 'DISTANCE.3'] },
    },
    formules: [
      ({
        a,
        c,
        d,
        e,
        f,
        poidsA,
        poidsC,
        poidsD,
        poidsE,
        poidsF,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) +
        poidsD * siPasTout(d) +
        poidsE * siAucune(e) -
        poidsF * siTout(f),
    ],
  },
};

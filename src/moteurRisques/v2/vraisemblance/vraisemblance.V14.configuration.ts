/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V14: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: { poids: 1, idsMesures: ['MCO_MCS.15', 'MCO_MCS.5', 'MCO_MCS.6'] },
      e: { poids: 1, idsMesures: ['CONTRAT.1'] },
    },
    formules: [
      ({
        a,
        b,
        c,
        e,
        poidsA,
        poidsB,
        poidsC,
        poidsE,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) +
        poidsB * siAucune(b) +
        poidsE * siPasTout(e),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: {
        poids: 1,
        idsMesures: [
          'CONFIG.1',
          'CONFIG.6',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
        ],
      },
      d: { poids: 1, idsMesures: ['DISTANCE.2', 'AUTH.4'] },
      e: {
        poids: 1,
        idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1', 'ECOSYSTEME.2'],
      },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        e,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
        poidsE,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) -
        poidsD * siTout(d) +
        poidsB * siAucune(b) +
        poidsE * siPasTout(e),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: {
        poids: 1,
        idsMesures: [
          'CLOISON.3',
          'CONFIG.1',
          'CONFIG.2',
          'CONFIG.3',
          'CONFIG.6',
          'MCO_MCS.1',
          'MCO_MCS.17',
          'MCO_MCS.3',
          'MCO_MCS.4',
          'MCO_MCS.5',
          'MCO_MCS.6',
          'MCO_MCS.7',
        ],
      },
      d: { poids: 1, idsMesures: ['DISTANCE.2', 'AUTH.4'] },
      e: {
        poids: 1,
        idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1', 'ECOSYSTEME.2'],
      },
      z: {
        poids: 1,
        idsMesures: [
          'SUPERVISION.4',
          'SUPERVISION.5',
          'SUPERVISION.6',
          'SUPERVISION.7',
        ],
      },
    },
    formules: [
      ({
        a,
        b,
        c,
        d,
        e,
        z,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
        poidsE,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) -
        poidsD * siTout(d) +
        poidsB * siAucune(b) +
        poidsE * siPasTout(e) +
        poidsZ * siPasTout(z),
    ],
  },
};

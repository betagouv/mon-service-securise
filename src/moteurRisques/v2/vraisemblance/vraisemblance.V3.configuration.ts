/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V3: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['MCO_MCS.14', 'MCO_MCS.5', 'MCO_MCS.6'] },
      f: { poids: 1, idsMesures: ['DISTANCE.1', 'DISTANCE.2'] },
      g: { poids: 1, idsMesures: ['CONTRAT.1'] },
      h: { poids: 1, idsMesures: ['MALWARE.5', 'MALWARE.6'] },
    },
    formules: [
      ({
        a,
        f,
        g,
        h,
        poidsA,
        poidsF,
        poidsG,
        poidsH,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsH * siTout(h) -
        poidsF * siTout(f) +
        poidsG * siAucune(g),
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
          'CONFIG.1',
          'CONFIG.6',
          'AUTH.1',
        ],
      },
      f: { poids: 1, idsMesures: ['ECOSYSTEME.2', 'DISTANCE.1', 'DISTANCE.2'] },
      g: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      h: { poids: 1, idsMesures: ['MALWARE.3', 'MALWARE.4'] },
    },
    formules: [
      ({
        a,
        f,
        g,
        h,
        poidsA,
        poidsF,
        poidsG,
        poidsH,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsH * siTout(h) -
        poidsF * siTout(f) +
        poidsG * siAucune(g),
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
          'CONFIG.6',
          'AUTH.1',
        ],
      },
      b: { poids: 2, idsMesures: ['CONFIG.3'] },
      c: { poids: 1, idsMesures: ['ADMIN.4'] },
      d: { poids: 1, idsMesures: ['ADMIN.1', 'ADMIN.3', 'ANNUAIRE.5'] },
      e: { poids: 1, idsMesures: ['ADMIN.2', 'ADMIN.5'] },
      f: {
        poids: 1,
        idsMesures: [
          'ECOSYSTEME.2',
          'ADMIN.6',
          'ADMIN.7',
          'DISTANCE.1',
          'DISTANCE.2',
          'ANNUAIRE.2',
        ],
      },
      g: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      h: {
        poids: 1,
        idsMesures: ['MALWARE.3', 'MALWARE.4', 'MALWARE.5', 'MALWARE.6'],
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
        g,
        h,
        z,
        poidsA,
        poidsB,
        poidsC,
        poidsG,
        poidsH,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) -
        poidsH * siTout(h) +
        poidsG * siAucune(g) +
        poidsB * siAucune(b) +
        poidsZ * siPasTout(z),
      ({
        d,
        e,
        f,
        g,
        z,
        poidsD,
        poidsE,
        poidsF,
        poidsG,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsD * siTout(d) -
        poidsE * siTout(e) -
        poidsF * siTout(f) +
        poidsG * siAucune(g) +
        poidsZ * siPasTout(z),
    ],
  },
};

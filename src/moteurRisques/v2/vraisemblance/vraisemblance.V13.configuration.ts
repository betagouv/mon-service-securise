/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V13: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: { poids: 1, idsMesures: ['MCO_MCS.15', 'MCO_MCS.5', 'MCO_MCS.6'] },
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
        4 - poidsA * siTout(a) - poidsC * siTout(c) + poidsB * siAucune(b),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: {
        poids: 1,
        idsMesures: [
          'ECOSYSTEME.2',
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
        poidsC * siTout(c) -
        poidsD * siTout(d) +
        poidsB * siAucune(b),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['DEV.1'] },
      b: { poids: 1, idsMesures: ['AUDIT.6', 'AUDIT.2'] },
      c: {
        poids: 1,
        idsMesures: [
          'ECOSYSTEME.2',
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
        z,
        poidsA,
        poidsB,
        poidsC,
        poidsD,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) -
        poidsD * siTout(d) +
        poidsB * siAucune(b) +
        poidsZ * siPasTout(z),
    ],
  },
};

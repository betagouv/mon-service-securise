/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V1: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: {
        poids: 2,
        idsMesures: ['MCO_MCS.14', 'MCO_MCS.5', 'MCO_MCS.6', 'COMPADMIN.7'],
      },
      d: { poids: 1, idsMesures: ['RH.2'] },
      f: { poids: 2, idsMesures: ['MALWARE.6', 'MALWARE.5'] },
    },
    formules: [
      ({ a, poidsA }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a),
      ({ d, f, poidsD, poidsF }: ConfigurationPredicatVraisemblance) =>
        4 - poidsD * siTout(d) - poidsF * siTout(f),
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
          'CONFIG.6',
          'AUTH.1',
          'COMPADMIN.7',
        ],
      },
      c: { poids: 1, idsMesures: ['FILTRE.6'] },
      d: { poids: 1, idsMesures: ['RH.2'] },
      e: { poids: 1, idsMesures: ['MAIL.1', 'MALWARE.3'] },
      f: { poids: 2, idsMesures: ['MALWARE.4'] },
    },
    formules: [
      ({ a, c, poidsA, poidsC }: ConfigurationPredicatVraisemblance) =>
        4 - poidsA * siTout(a) - poidsC * siTout(c),
      ({
        d,
        e,
        f,
        poidsD,
        poidsE,
        poidsF,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsD * siTout(d) - poidsE * siTout(e) - poidsF * siTout(f),
    ],
  },
  niveau3: {
    groupes: {
      a: {
        poids: 2,
        idsMesures: [
          'MCO_MCS.1',
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
          'COMPADMIN.7',
        ],
      },
      b: { poids: 1, idsMesures: ['CONFIG.3'] },
      c: { poids: 1, idsMesures: ['FILTRE.6'] },
      d: { poids: 1, idsMesures: ['RH.2'] },
      e: { poids: 1, idsMesures: ['MAIL.1', 'MAIL.2', 'MALWARE.3'] },
      f: { poids: 2, idsMesures: ['MALWARE.4'] },
      g: { poids: 2, idsMesures: ['DISTANCE.3', 'AUTH.8', 'AUTH.4'] },
      z: {
        poids: 1,
        idsMesures: ['SUPERVISION.4', 'SUPERVISION.5', 'SUPERVISION.7'],
      },
    },
    formules: [
      ({
        a,
        b,
        c,
        z,
        poidsA,
        poidsB,
        poidsC,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) +
        poidsB * siAucune(b) +
        poidsZ * siPasTout(z),
      ({
        d,
        e,
        f,
        z,
        poidsD,
        poidsE,
        poidsF,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsD * siTout(d) -
        poidsE * siTout(e) -
        poidsF * siTout(f) +
        poidsZ * siPasTout(z),
      ({ d, g, poidsD, poidsG }: ConfigurationPredicatVraisemblance) =>
        4 - poidsG * siTout(g) - poidsD * siTout(d),
    ],
  },
};

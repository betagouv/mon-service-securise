/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siPasTout } from './vraisemblance.predicats.js';

export const V6: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: [
          'DROITS.1',
          'DROITS.3',
          'COMPADMIN.1',
          'ID.1',
          'ID.2',
          'ID.3',
          'ID.4',
        ],
      },
      d: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.2',
          'COMPADMIN.3',
          'COMPADMIN.4',
          'COMPADMIN.5',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      e: { poids: 1, idsMesures: ['AUTH.5', 'AUTH.11'] },
      f: { poids: 1, idsMesures: ['AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) +
        poidsD * siPasTout(d),
      ({
        b,
        e,
        f,
        poidsB,
        poidsE,
        poidsF,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsB * siTout(b) - poidsE * siTout(e) - poidsF * siTout(f),
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
          'DROITS.1',
          'DROITS.3',
          'COMPADMIN.1',
          'ID.1',
          'ID.2',
          'ID.3',
          'ID.4',
        ],
      },
      d: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.2',
          'COMPADMIN.3',
          'COMPADMIN.4',
          'COMPADMIN.5',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      e: {
        poids: 1,
        idsMesures: ['AUTH.2', 'AUTH.3', 'AUTH.4', 'AUTH.11', 'AUTH.12'],
      },
      f: { poids: 1, idsMesures: ['AUTH.8', 'AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) +
        poidsD * siPasTout(d),
      ({
        b,
        e,
        f,
        poidsB,
        poidsE,
        poidsF,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsB * siTout(b) - poidsE * siTout(e) - poidsF * siTout(f),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2', 'MAIL.1', 'MAIL.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: [
          'RH.4',
          'DROITS.1',
          'DROITS.3',
          'COMPADMIN.1',
          'ID.1',
          'ID.2',
          'ID.3',
          'ID.4',
        ],
      },
      d: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.2',
          'COMPADMIN.3',
          'COMPADMIN.4',
          'COMPADMIN.5',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      e: {
        poids: 1,
        idsMesures: ['AUTH.2', 'AUTH.3', 'AUTH.4', 'AUTH.11', 'AUTH.12'],
      },
      f: { poids: 1, idsMesures: ['AUTH.8', 'AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) +
        poidsD * siPasTout(d) +
        poidsZ * siPasTout(z),
      ({
        b,
        e,
        f,
        z,
        poidsB,
        poidsE,
        poidsF,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsB * siTout(b) -
        poidsE * siTout(e) -
        poidsF * siTout(f) +
        poidsZ * siPasTout(z),
    ],
  },
};

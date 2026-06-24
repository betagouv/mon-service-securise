/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siPasTout } from './vraisemblance.predicats.js';

export const V5: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: ['AUTH.10', 'ID.1', 'ID.2', 'ID.4', 'DROITS.1', 'DROITS.3'],
      },
      d: { poids: 1, idsMesures: ['AUTH.11', 'AUTH.7'] },
      e: { poids: 1, idsMesures: ['AUTH.9'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) - poidsC * siTout(c),
      ({
        b,
        d,
        e,
        poidsB,
        poidsD,
        poidsE,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsB * siTout(b) - poidsD * siTout(d) - poidsE * siTout(e),
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
          'AUTH.10',
          'ID.1',
          'ID.2',
          'ID.4',
          'DROITS.1',
          'DROITS.3',
        ],
      },
      d: {
        poids: 1,
        idsMesures: ['AUTH.11', 'AUTH.12', 'AUTH.4', 'AUTH.2', 'AUTH.3'],
      },
      e: { poids: 1, idsMesures: ['AUTH.9', 'AUTH.8'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) - poidsC * siTout(c),
      ({
        b,
        d,
        e,
        poidsB,
        poidsD,
        poidsE,
      }: ConfigurationPredicatVraisemblance) =>
        4 - poidsB * siTout(b) - poidsD * siTout(d) - poidsE * siTout(e),
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
          'AUTH.10',
          'ID.1',
          'ID.2',
          'ID.4',
          'DROITS.1',
          'DROITS.3',
        ],
      },
      d: {
        poids: 1,
        idsMesures: ['AUTH.11', 'AUTH.12', 'AUTH.4', 'AUTH.2', 'AUTH.3'],
      },
      e: { poids: 1, idsMesures: ['AUTH.9', 'AUTH.8'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) +
        poidsZ * siPasTout(z),
      ({
        b,
        d,
        e,
        z,
        poidsB,
        poidsD,
        poidsE,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsB * siTout(b) -
        poidsD * siTout(d) -
        poidsE * siTout(e) +
        poidsZ * siPasTout(z),
    ],
  },
};

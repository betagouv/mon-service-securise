/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationPredicatVraisemblance,
  ConfigurationVraisemblancePourUnVecteur,
} from './vraisemblance.types.js';
import { siPasTout, siTout } from './vraisemblance.predicats.js';

export const V7: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: ['DROITS.1', 'DROITS.3', 'ID.1', 'ID.2', 'ID.3', 'ID.4'],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1'] },
      e: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.1',
          'COMPADMIN.2',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      f: { poids: 1, idsMesures: ['AUTH.5', 'AUTH.11'] },
      g: { poids: 1, idsMesures: ['AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) -
        poidsE * siTout(e) +
        poidsD * siPasTout(d),
      ({
        b,
        d,
        f,
        g,
        poidsB,
        poidsD,
        poidsF,
        poidsG,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsB * siTout(b) -
        poidsF * siTout(f) -
        poidsG * siTout(g) +
        poidsD * siPasTout(d),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2', 'MAIL.1'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: ['RH.4', 'DROITS.1', 'DROITS.3', 'ID.1', 'ID.2', 'ID.4'],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      e: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.1',
          'COMPADMIN.2',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      f: {
        poids: 1,
        idsMesures: ['AUTH.2', 'AUTH.3', 'AUTH.4', 'AUTH.11', 'AUTH.12'],
      },
      g: { poids: 1, idsMesures: ['AUTH.8', 'AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) -
        poidsE * siTout(e) +
        poidsD * siPasTout(d),
      ({
        b,
        d,
        f,
        g,
        poidsB,
        poidsD,
        poidsF,
        poidsG,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsB * siTout(b) -
        poidsF * siTout(f) -
        poidsG * siTout(g) +
        poidsD * siPasTout(d),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['RH.2', 'MAIL.1', 'MAIL.2'] },
      b: { poids: 1, idsMesures: ['DISTANCE.2', 'DISTANCE.4'] },
      c: {
        poids: 1,
        idsMesures: ['RH.4', 'DROITS.1', 'DROITS.3', 'ID.1', 'ID.2', 'ID.4'],
      },
      d: { poids: 1, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      e: {
        poids: 1,
        idsMesures: [
          'COMPADMIN.1',
          'COMPADMIN.2',
          'COMPADMIN.3',
          'COMPADMIN.4',
          'COMPADMIN.5',
          'COMPADMIN.6',
          'COMPADMIN.9',
        ],
      },
      f: {
        poids: 1,
        idsMesures: ['AUTH.2', 'AUTH.3', 'AUTH.4', 'AUTH.11', 'AUTH.12'],
      },
      g: { poids: 1, idsMesures: ['AUTH.8', 'AUTH.9'] },
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
        poidsB * siTout(b) -
        poidsC * siTout(c) -
        poidsE * siTout(e) +
        poidsD * siPasTout(d) +
        poidsZ * siPasTout(z),
      ({
        b,
        d,
        f,
        g,
        z,
        poidsB,
        poidsD,
        poidsF,
        poidsG,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsB * siTout(b) -
        poidsF * siTout(f) -
        poidsG * siTout(g) +
        poidsD * siPasTout(d) +
        poidsZ * siPasTout(z),
    ],
  },
};

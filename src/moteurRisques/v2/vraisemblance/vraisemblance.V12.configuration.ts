/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationPredicatVraisemblance,
  ConfigurationVraisemblancePourUnVecteur,
} from './vraisemblance.types.js';
import { siPasTout, siTout } from './vraisemblance.predicats.js';

export const V12: ConfigurationVraisemblancePourUnVecteur = {
  niveau2: {
    groupes: {
      a: { poids: 2, idsMesures: ['FILTRE.4'] },
      b: { poids: 1, idsMesures: ['FILTRE.1'] },
      c: { poids: 1, idsMesures: ['FILTRE.3'] },
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
        4 - poidsA * siTout(a) - poidsB * siTout(b) + poidsC * siPasTout(c),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 2, idsMesures: ['FILTRE.4'] },
      b: { poids: 1, idsMesures: ['CLOISON.4', 'FILTRE.1', 'FILTRE.2'] },
      c: { poids: 1, idsMesures: ['FILTRE.3'] },
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
        poidsB * siTout(b) +
        poidsC * siPasTout(c) +
        poidsZ * siPasTout(z),
    ],
  },
};

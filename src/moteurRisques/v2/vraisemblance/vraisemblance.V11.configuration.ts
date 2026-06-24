/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationPredicatVraisemblance,
  ConfigurationVraisemblancePourUnVecteur,
} from './vraisemblance.types.js';
import { siPasTout, siTout } from './vraisemblance.predicats.js';

export const V11: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: { c: { poids: 2, idsMesures: ['CONTRAT.1'] } },
    formules: [
      ({ c, poidsC }: ConfigurationPredicatVraisemblance) =>
        4 - poidsC * siTout(c),
    ],
  },
  niveau2: {
    groupes: {
      a: { poids: 1, idsMesures: ['PHYS.1'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 2, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      d: { poids: 1, idsMesures: ['MCO_MCS.11', 'MCO_MCS.12'] },
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
        poidsD * siTout(d) +
        poidsC * siPasTout(c),
    ],
  },
  niveau3: {
    groupes: {
      a: { poids: 1, idsMesures: ['PHYS.1', 'PHYS.2'] },
      b: { poids: 1, idsMesures: ['CONFIG.8'] },
      c: { poids: 2, idsMesures: ['CONTRAT.1', 'CONTRAT.2', 'ECOSYSTEME.1'] },
      d: { poids: 1, idsMesures: ['MCO_MCS.11', 'MCO_MCS.12'] },
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
        poidsD * siTout(d) +
        poidsC * siPasTout(c),
    ],
  },
};

/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourVraisemblance.sh
  Ne pas modifier directement
*/

import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';

export const V2: ConfigurationVraisemblancePourUnVecteur = {
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
      g: {
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
        z,
        poidsA,
        poidsB,
        poidsC,
        poidsG,
        poidsZ,
      }: ConfigurationPredicatVraisemblance) =>
        4 -
        poidsA * siTout(a) -
        poidsC * siTout(c) +
        poidsB * siAucune(b) -
        poidsG * siTout(g) +
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
    ],
  },
};

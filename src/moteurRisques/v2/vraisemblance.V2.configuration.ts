import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune } from './vraisemblance.predicats.js';

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
        ],
      },
      b: { poids: 2, idsMesures: ['CONFIG.3'] },
      c: { poids: 2, idsMesures: ['ADMIN.4'] },
      d: { poids: 1, idsMesures: ['ADMIN.1', 'ADMIN.3'] },
      e: { poids: 1, idsMesures: ['ADMIN.2', 'ADMIN.5'] },
      f: { poids: 1, idsMesures: ['ADMIN.6', 'ADMIN.7'] },
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
};

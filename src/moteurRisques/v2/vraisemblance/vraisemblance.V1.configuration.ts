import {
  ConfigurationVraisemblancePourUnVecteur,
  ConfigurationPredicatVraisemblance,
} from './vraisemblance.types.js';
import { siTout, siAucune } from './vraisemblance.predicats.js';

export const V1: ConfigurationVraisemblancePourUnVecteur = {
  niveau1: {
    groupes: {
      a: { poids: 2, idsMesures: ['MCO_MCS.14', 'MCO_MCS.5', 'MCO_MCS.6'] },
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
        ],
      },
      b: { poids: 1, idsMesures: ['CONFIG.3'] },
      c: { poids: 1, idsMesures: ['FILTRE.6'] },
      d: { poids: 1, idsMesures: ['RH.2'] },
      e: { poids: 1, idsMesures: ['MAIL.1', 'MALWARE.3'] },
      f: { poids: 2, idsMesures: ['MALWARE.4'] },
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
      ({ d, e, poidsD, poidsE }: ConfigurationPredicatVraisemblance) =>
        4 - poidsD * siTout(d) - poidsE * siTout(e),
    ],
  },
};

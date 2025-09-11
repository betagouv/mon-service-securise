import { ReglesDuReferentielMesuresV2 } from '../moteurReglesV2.js';
import { mesuresV2 } from '../../donneesReferentielMesuresV2.js';

export type RegleBrut = {
  ref: keyof typeof mesuresV2;
  'Statut Initial': 'Présente' | 'Absente';
};

export class ParsingReglesDeMesuresV2 {
  // eslint-disable-next-line no-empty-function
  constructor(private reglesBrutes: RegleBrut[]) {}

  regles(): ReglesDuReferentielMesuresV2 {
    return this.reglesBrutes.map((r) => ({
      reference: r.ref,
      dansSocleInitial: r['Statut Initial'] === 'Présente',
      modificateurs: {},
    }));
  }
}

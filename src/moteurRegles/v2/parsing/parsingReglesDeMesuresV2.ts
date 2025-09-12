import {
  Modificateur,
  ReglesDuReferentielMesuresV2,
} from '../moteurReglesV2.js';
import { mesuresV2 } from '../../../../donneesReferentielMesuresV2.js';

type ModificateurBrut = 'Indispensable';

export type RegleBrut = {
  ref: keyof typeof mesuresV2;
  'Statut Initial': 'Présente' | 'Absente';
  modificateurs: [string, [string, ModificateurBrut]][];
};

export class ParsingReglesDeMesuresV2 {
  private mappingVersMSS: Record<
    string,
    { champMSS: string; mappingValeursDuChamp: Record<string, string> }
  > = {
    'Niveau de Sécurité': {
      champMSS: 'niveauSecurite',
      mappingValeursDuChamp: { Basique: 'niveau1' },
    },
  };

  // eslint-disable-next-line no-empty-function
  constructor(private reglesBrutes: RegleBrut[]) {}

  regles(): ReglesDuReferentielMesuresV2 {
    return this.reglesBrutes.map((r) => ({
      reference: r.ref,
      dansSocleInitial: r['Statut Initial'] === 'Présente',
      modificateurs: Object.fromEntries(
        r.modificateurs.map(([champBrut, modification]) => {
          const cible = this.mappingVersMSS[champBrut];
          const [valeurBrute, modificateurBrut] = modification;

          return [
            cible.champMSS,
            [
              [
                cible.mappingValeursDuChamp[valeurBrute],
                this.traduisModificateur(modificateurBrut),
              ],
            ],
          ];
        })
      ),
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  private traduisModificateur(modificateurBrut: ModificateurBrut) {
    const mappingDesModificateurs: Record<ModificateurBrut, Modificateur> = {
      Indispensable: 'RendreIndispensable',
    };

    return mappingDesModificateurs[modificateurBrut];
  }
}

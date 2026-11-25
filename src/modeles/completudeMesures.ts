import { StatistiquesMesures } from './statistiquesMesures.js';
import MesuresSpecifiques from './mesuresSpecifiques.js';

export type DonneesCompletudeMesures = {
  statistiquesMesuresGenerales: StatistiquesMesures;
  mesuresSpecifiques: MesuresSpecifiques;
};

export type Completude = {
  nombreTotalMesures: number;
  nombreMesuresCompletes: number;
};

class CompletudeMesures {
  readonly nombreTotalMesures: number;
  readonly nombreMesuresCompletes: number;

  constructor({
    statistiquesMesuresGenerales,
    mesuresSpecifiques,
  }: DonneesCompletudeMesures) {
    this.nombreTotalMesures =
      statistiquesMesuresGenerales.indispensables().total +
      statistiquesMesuresGenerales.recommandees().total +
      mesuresSpecifiques.nombre();

    this.nombreMesuresCompletes =
      this.nombreTotalMesures -
      statistiquesMesuresGenerales.sansStatutToutesCategories() -
      mesuresSpecifiques.nombreDeSansStatut();
  }

  completude(): Completude {
    return {
      nombreTotalMesures: this.nombreTotalMesures,
      nombreMesuresCompletes: this.nombreMesuresCompletes,
    };
  }
}

export { CompletudeMesures };

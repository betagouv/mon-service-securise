class CompletudeMesures {
  constructor({ statistiquesMesuresGenerales, mesuresSpecifiques }) {
    this.nombreTotalMesures =
      statistiquesMesuresGenerales.indispensables().total +
      statistiquesMesuresGenerales.recommandees().total +
      mesuresSpecifiques.nombre();

    this.nombreMesuresCompletes =
      this.nombreTotalMesures -
      statistiquesMesuresGenerales.sansStatutToutesCategories() -
      mesuresSpecifiques.nombreDeSansStatut();
  }

  completude() {
    return {
      nombreTotalMesures: this.nombreTotalMesures,
      nombreMesuresCompletes: this.nombreMesuresCompletes,
    };
  }
}

module.exports = { CompletudeMesures };

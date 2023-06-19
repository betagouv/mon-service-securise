class ConstructeurMesures {
  constructor() {
    this.nombreTotalMesures = 0;
    this.nombreMesuresCompletes = 0;
    this.statutsMesuresPersonnalisees = [];
    this.indiceCyber = 0.0;
  }

  avecUneCompletude(nombreTotalMesures, nombreMesuresCompletes) {
    this.nombreTotalMesures = nombreTotalMesures;
    this.nombreMesuresCompletes = nombreMesuresCompletes;
    return this;
  }

  construis() {
    return {
      statistiques: () => ({
        completude: () => ({
          nombreTotalMesures: this.nombreTotalMesures,
          nombreMesuresCompletes: this.nombreMesuresCompletes,
        }),
      }),
      statutsMesuresPersonnalisees: () => this.statutsMesuresPersonnalisees,
      indiceCyber: () => ({ total: this.indiceCyber }),
    };
  }
}

const bouchonneMesures = () => new ConstructeurMesures();

module.exports = { bouchonneMesures };

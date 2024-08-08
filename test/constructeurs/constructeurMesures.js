class ConstructeurMesures {
  constructor() {
    this.nombreTotalMesures = 0;
    this.nombreMesuresCompletes = 0;
    this.indiceCyber = 0.0;
  }

  avecUneCompletude(nombreTotalMesures, nombreMesuresCompletes) {
    this.nombreTotalMesures = nombreTotalMesures;
    this.nombreMesuresCompletes = nombreMesuresCompletes;
    return this;
  }

  construis() {
    return {
      completude: () => ({
        nombreTotalMesures: this.nombreTotalMesures,
        nombreMesuresCompletes: this.nombreMesuresCompletes,
      }),
      enrichiesAvecDonneesPersonnalisees: () => ({ mesuresGenerales: {} }),
      indiceCyber: () => ({ total: this.indiceCyber }),
    };
  }
}

const bouchonneMesures = () => new ConstructeurMesures();

module.exports = { bouchonneMesures };

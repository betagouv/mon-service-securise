const {
  StatistiquesMesuresGenerales,
} = require('../../src/modeles/statistiquesMesuresGenerales');
const MesuresGenerales = require('../../src/modeles/mesuresGenerales');

class ConstructeurStatistiquesMesuresGenerales {
  constructor(referentiel) {
    this.donnees = {
      mesuresGenerales: [],
      mesuresPersonnalisees: {},
    };
    this.referentiel = referentiel;
  }

  surLesMesuresGenerales(donneesMesuresGenerales) {
    this.donnees.mesuresGenerales = donneesMesuresGenerales;
    return this;
  }

  avecMesuresPersonnalisees(donneesMesuresPersonnalisees) {
    this.donnees.mesuresPersonnalisees = donneesMesuresPersonnalisees;
    return this;
  }

  construis() {
    return new StatistiquesMesuresGenerales(
      {
        mesuresGenerales: new MesuresGenerales(
          { mesuresGenerales: this.donnees.mesuresGenerales },
          this.referentiel
        ),
        mesuresPersonnalisees: this.donnees.mesuresPersonnalisees,
      },
      this.referentiel
    );
  }
}

const desStatistiques = (referentiel) =>
  new ConstructeurStatistiquesMesuresGenerales(referentiel);

module.exports = { desStatistiques };

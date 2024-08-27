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
    this.ignoreMesuresNonPrisesEnCompte = false;
  }

  surLesMesuresGenerales(donneesMesuresGenerales) {
    this.donnees.mesuresGenerales = donneesMesuresGenerales;
    return this;
  }

  avecMesuresPersonnalisees(donneesMesuresPersonnalisees) {
    this.donnees.mesuresPersonnalisees = donneesMesuresPersonnalisees;
    return this;
  }

  ignoreLesMesuresNonPrisesEnCompte() {
    this.ignoreMesuresNonPrisesEnCompte = true;
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
      this.referentiel,
      this.ignoreMesuresNonPrisesEnCompte
    );
  }
}

const desStatistiques = (referentiel) =>
  new ConstructeurStatistiquesMesuresGenerales(referentiel);

module.exports = { desStatistiques };

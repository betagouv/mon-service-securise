import { StatistiquesMesures } from '../../src/modeles/statistiquesMesures.js';
import MesuresGenerales from '../../src/modeles/mesuresGenerales.js';

class ConstructeurStatistiquesMesures {
  constructor(referentiel) {
    this.donnees = {
      mesuresGenerales: [],
      mesuresPersonnalisees: {},
      mesuresSpecifiques: [],
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

  avecMesuresSpecifiques(donneesMesuresSpecifiques) {
    this.donnees.mesuresSpecifiques = donneesMesuresSpecifiques;
    return this;
  }

  ignoreLesMesuresNonPrisesEnCompte() {
    this.ignoreMesuresNonPrisesEnCompte = true;
    return this;
  }

  construis() {
    return new StatistiquesMesures(
      {
        mesuresGenerales: new MesuresGenerales(
          { mesuresGenerales: this.donnees.mesuresGenerales },
          this.referentiel
        ),
        mesuresPersonnalisees: this.donnees.mesuresPersonnalisees,
        mesuresSpecifiques: this.donnees.mesuresSpecifiques,
      },
      this.referentiel,
      this.ignoreMesuresNonPrisesEnCompte
    );
  }
}

const desStatistiques = (referentiel) =>
  new ConstructeurStatistiquesMesures(referentiel);

export { desStatistiques };

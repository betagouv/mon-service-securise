const Risque = require('./risque');

class RisqueSpecifique extends Risque {
  constructor(donneesRisque, referentiel) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('intitule');
    this.proprietesListes.push('categories');
    this.proprietesAtomiquesFacultatives.push('description');
    this.renseigneProprietes(donneesRisque);
  }

  categoriesRisque() {
    return this.categories;
  }

  intituleRisque() {
    return this.intitule;
  }
}

module.exports = RisqueSpecifique;

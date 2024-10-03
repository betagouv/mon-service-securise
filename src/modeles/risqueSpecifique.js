const Risque = require('./risque');
const { ErreurIntituleRisqueManquant } = require('../erreurs');

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

  static valide({ intitule }) {
    if (!intitule) {
      throw new ErreurIntituleRisqueManquant(
        "L'intitulé du risque est obligatoire."
      );
    }
  }
}

module.exports = RisqueSpecifique;

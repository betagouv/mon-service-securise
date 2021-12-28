const Risque = require('./risque');

class RisqueSpecifique extends Risque {
  constructor(donneesRisque, referentiel) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('description');
    this.renseigneProprietes(donneesRisque);
  }

  descriptionRisque() {
    return this.description;
  }
}

module.exports = RisqueSpecifique;

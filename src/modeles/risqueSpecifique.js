const Risque = require('./risque');

class RisqueSpecifique extends Risque {
  constructor(donneesRisque, referentiel) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('intitule');
    this.proprietesAtomiquesFacultatives.push('description');
    this.renseigneProprietes(donneesRisque);
  }

  intituleRisque() {
    return this.intitule;
  }
}

module.exports = RisqueSpecifique;

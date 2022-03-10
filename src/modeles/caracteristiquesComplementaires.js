const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class CaracteristiquesComplementaires extends InformationsHomologation {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    super();
    this.renseigneProprietes(donneesCaracteristiques);

    this.referentiel = referentiel;
  }

  /* eslint-disable class-methods-use-this */
  statutSaisie() {
    return InformationsHomologation.COMPLETES;
  }
}

module.exports = CaracteristiquesComplementaires;

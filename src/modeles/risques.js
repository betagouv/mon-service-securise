const InformationsHomologation = require('./informationsHomologation');
const RisquesGeneraux = require('./risquesGeneraux');
const RisquesSpecifiques = require('./risquesSpecifiques');
const Referentiel = require('../referentiel');

class Risques extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['risquesVerifies'], [], {
      risquesGeneraux: RisquesGeneraux,
      risquesSpecifiques: RisquesSpecifiques,
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  statutSaisie() {
    if (!this.verifies()) return Risques.A_SAISIR;

    return this.risquesSpecifiques.statutSaisie();
  }

  verifies() {
    return this.risquesVerifies;
  }
}

module.exports = Risques;

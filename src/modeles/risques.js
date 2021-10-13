const InformationsHomologation = require('./informationsHomologation');
const RisquesGeneraux = require('./risquesGeneraux');
const Referentiel = require('../referentiel');

class Risques extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['risquesVerifies'], [], { risques: RisquesGeneraux });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  statutSaisie() {
    return this.verifies() ? Risques.COMPLETES : Risques.A_SAISIR;
  }

  verifies() {
    return this.risquesVerifies;
  }
}

module.exports = Risques;

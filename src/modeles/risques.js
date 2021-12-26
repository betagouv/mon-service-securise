const InformationsHomologation = require('./informationsHomologation');
const RisquesGeneraux = require('./risquesGeneraux');
const RisquesSpecifiques = require('./risquesSpecifiques');
const Referentiel = require('../referentiel');

class Risques extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesFacultatives: ['risquesVerifies'],
      listesAgregats: { risquesGeneraux: RisquesGeneraux, risquesSpecifiques: RisquesSpecifiques },
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  verifies() {
    return this.risquesVerifies;
  }
}

module.exports = Risques;

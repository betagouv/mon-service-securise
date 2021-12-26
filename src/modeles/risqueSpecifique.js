const Risque = require('./risque');
const Referentiel = require('../referentiel');

class RisqueSpecifique extends Risque {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['description', 'niveauGravite'],
      proprietesAtomiquesFacultatives: ['commentaire'],
    });
    Risque.valide(donneesRisque, referentiel);
    this.renseigneProprietes(donneesRisque);
  }
}

module.exports = RisqueSpecifique;

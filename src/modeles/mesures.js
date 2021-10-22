const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const Referentiel = require('../referentiel');

class Mesures extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super([], [], { mesures: MesuresGenerales });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  nonSaisies() {
    return this.mesures.nonSaisies();
  }

  proportion(...params) {
    return this.mesures.proportion(...params);
  }

  statistiques() {
    return this.mesures.statistiques();
  }

  statutSaisie() {
    return this.mesures.statutSaisie();
  }
}

module.exports = Mesures;

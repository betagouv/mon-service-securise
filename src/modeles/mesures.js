const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const Referentiel = require('../referentiel');

class Mesures extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super([], [], { mesuresGenerales: MesuresGenerales });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  nonSaisies() {
    return this.mesuresGenerales.nonSaisies();
  }

  proportion(...params) {
    return this.mesuresGenerales.proportion(...params);
  }

  statistiques() {
    return this.mesuresGenerales.statistiques();
  }

  statutSaisie() {
    return this.mesuresGenerales.statutSaisie();
  }
}

module.exports = Mesures;

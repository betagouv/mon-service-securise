const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');

class Mesures extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
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
    return this.mesuresSpecifiques.statutSaisie() === InformationsHomologation.A_COMPLETER
      ? InformationsHomologation.A_COMPLETER
      : this.mesuresGenerales.statutSaisie();
  }
}

module.exports = Mesures;

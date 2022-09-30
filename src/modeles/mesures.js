const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');

class Mesures extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide(), identifiantsMesures) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
    this.identifiantsMesures = identifiantsMesures || this.referentiel.identifiantsMesures();
  }

  indiceCyber() {
    return this.statistiques().indiceCyber();
  }

  nonSaisies() {
    return this.mesuresGenerales.nonSaisies();
  }

  proportion(...params) {
    return this.mesuresGenerales.proportion(...params);
  }

  statistiques() {
    return this.mesuresGenerales.statistiques(this.identifiantsMesures);
  }

  statutSaisie() {
    const statutSaisieMesures = super.statutSaisie();
    if (statutSaisieMesures === Mesures.COMPLETES
      && this.identifiantsMesures.length !== this.mesuresGenerales.nombre()) {
      return Mesures.A_COMPLETER;
    }

    return statutSaisieMesures;
  }
}

module.exports = Mesures;

const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');

class Mesures extends InformationsHomologation {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    mesuresPersonnalisees = {},
  ) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
    this.mesuresPersonnalisees = mesuresPersonnalisees;
  }

  indiceCyber() {
    return this.statistiques().indiceCyber();
  }

  nombreMesuresPersonnalisees() {
    return Object.keys(this.mesuresPersonnalisees).length;
  }

  nombreMesuresSpecifiques() {
    return this.mesuresSpecifiques.nombre();
  }

  nombreTotalMesuresGenerales() {
    return this.nombreMesuresPersonnalisees();
  }

  nonSaisies() {
    return this.mesuresGenerales.nonSaisies();
  }

  parStatut() {
    const mesuresGeneralesParStatut = this.mesuresGenerales.parStatut();
    return this.mesuresSpecifiques.parStatut(mesuresGeneralesParStatut);
  }

  statistiques() {
    return this.mesuresGenerales.statistiques(this.mesuresPersonnalisees);
  }

  statutSaisie() {
    const statutSaisieMesures = super.statutSaisie();
    if (statutSaisieMesures === Mesures.COMPLETES
      && this.nombreMesuresPersonnalisees() !== this.mesuresGenerales.nombre()) {
      return Mesures.A_COMPLETER;
    }

    return statutSaisieMesures;
  }
}

module.exports = Mesures;

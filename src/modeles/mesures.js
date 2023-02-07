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

  parStatutEtCategorie() {
    const mesuresGeneralesParStatut = this.mesuresGenerales.parStatutEtCategorie();
    return this.mesuresSpecifiques.parStatutEtCategorie(mesuresGeneralesParStatut);
  }

  statistiques() {
    return this.mesuresGenerales.statistiques(
      this.mesuresPersonnalisees,
      this.mesuresSpecifiques
    );
  }

  statutSaisie() {
    const statutSaisieMesures = super.statutSaisie();
    if (statutSaisieMesures === Mesures.COMPLETES
      && this.nombreMesuresPersonnalisees() !== this.mesuresGenerales.nombre()) {
      return Mesures.A_COMPLETER;
    }

    return statutSaisieMesures;
  }

  statutsMesuresPersonnalisees() {
    const personnalisees = ({ id: idMesure }) => (
      Object.keys(this.mesuresPersonnalisees).includes(idMesure)
    );

    return this.mesuresGenerales.toutes()
      .filter(personnalisees)
      .filter((m) => m.statut !== '')
      .map((m) => ({ idMesure: m.id, statut: m.statut }));
  }
}

module.exports = Mesures;

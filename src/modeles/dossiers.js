const Dossier = require('./dossier');
const ElementsConstructibles = require('./elementsConstructibles');
const { ErreurDossiersInvalides } = require('../erreurs');
const Referentiel = require('../referentiel');

class Dossiers extends ElementsConstructibles {
  constructor(
    donnees = { dossiers: [] },
    referentiel = Referentiel.creeReferentielVide()
  ) {
    const { dossiers } = donnees;
    Dossiers.valide(donnees);
    super(Dossier, { items: dossiers }, referentiel);
  }

  dossierCourant() {
    return this.items.find((i) => !i.finalise);
  }

  dossierActif() {
    return this.finalises()
      .filter((d) => d.estActif())
      .sort(
        (a, b) =>
          new Date(b.decision.dateHomologation) -
          new Date(a.decision.dateHomologation)
      )[0];
  }

  finalises() {
    return this.items.filter((i) => i.finalise);
  }

  statutSaisie() {
    if (this.nombre() === 0) {
      return Dossiers.A_SAISIR;
    }
    return this.dossierActif() ? Dossiers.COMPLETES : Dossiers.A_COMPLETER;
  }

  static valide({ dossiers }) {
    const nombreDossiersNonFinalises = dossiers.filter(
      (d) => !d.finalise
    ).length;

    if (nombreDossiersNonFinalises > 1) {
      throw new ErreurDossiersInvalides(
        "Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé"
      );
    }
  }
}

module.exports = Dossiers;

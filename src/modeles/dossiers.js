const Dossier = require('./dossier');
const ElementsConstructibles = require('./elementsConstructibles');
const { ErreurDossiersInvalides } = require('../erreurs');
const Referentiel = require('../referentiel');

class Dossiers extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { dossiers } = donnees;
    Dossiers.valide(donnees);
    super(Dossier, { items: dossiers }, referentiel);
  }

  dossierCourant() {
    return this.items.find((i) => !i.finalise);
  }

  static valide({ dossiers }) {
    const nombreDossiersNonFinalises = dossiers
      .filter((d) => !d.finalise)
      .length;

    if (nombreDossiersNonFinalises > 1) {
      throw new ErreurDossiersInvalides("Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé");
    }
  }
}

module.exports = Dossiers;

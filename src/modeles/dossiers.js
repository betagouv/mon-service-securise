const Dossier = require('./dossier');
const ElementsConstructibles = require('./elementsConstructibles');
const { ErreurDossiersInvalides } = require('../erreurs');
const Referentiel = require('../referentiel');

const STATUTS_HOMOLOGATION = {
  A_REALISER: 'aRealiser',
  A_FINALISER: 'aFinaliser',
  REALISEE: 'realisee',
  BIENTOT_EXPIREE: 'bientotExpiree',
  EXPIREE: 'expiree',
};
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

  statutHomologation() {
    if (this.nombre() === 0) return Dossiers.A_REALISER;
    if (this.dossierCourant()) return Dossiers.A_FINALISER;
    const dossierActif = this.dossierActif();
    if (dossierActif) {
      if (dossierActif.estBientotExpire()) return Dossiers.BIENTOT_EXPIREE;
      return Dossiers.REALISEE;
    }
    return Dossiers.EXPIREE;
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

Object.assign(Dossiers, STATUTS_HOMOLOGATION);
module.exports = Dossiers;

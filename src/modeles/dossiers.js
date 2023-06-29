const Dossier = require('./dossier');
const ElementsConstructibles = require('./elementsConstructibles');
const {
  ErreurDossiersInvalides,
  ErreurDossierNonFinalisable,
} = require('../erreurs');
const Referentiel = require('../referentiel');

const STATUTS_HOMOLOGATION = {
  NON_REALISEE: 'nonRealisee',
  ACTIVEE: 'activee',
  BIENTOT_ACTIVEE: 'bientotActivee',
  EXPIREE: 'expiree',
  BIENTOT_EXPIREE: 'bientotExpiree',
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
    if (this.items.filter((dossier) => dossier.estActif()).length > 1)
      throw new ErreurDossiersInvalides(
        "Les dossiers ne peuvent pas avoir plus d'un dossier actif"
      );
    return this.items.find((dossier) => dossier.estActif());
  }

  finaliseDossierCourant() {
    if (!this.dossierCourant())
      throw new ErreurDossierNonFinalisable(
        'Aucun dossier courant à finaliser'
      );

    this.items.forEach((dossier) => {
      if (dossier !== this.dossierCourant()) dossier.enregistreArchivage();
    });
    this.dossierCourant().enregistreFinalisation();
  }

  finalises() {
    return this.items.filter((i) => i.finalise);
  }

  statutHomologation() {
    if (this.nombre() === 0 || this.finalises().length === 0)
      return Dossiers.NON_REALISEE;

    return this.dossierActif().statutHomologation();
  }

  statutSaisie() {
    if (this.dossierCourant()) return Dossiers.A_COMPLETER;
    return Dossiers.A_SAISIR;
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

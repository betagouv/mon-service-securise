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

    const dossierActif = this.dossierActif();
    if (dossierActif) {
      if (dossierActif.estBientotExpire()) return Dossiers.BIENTOT_EXPIREE;
      return Dossiers.ACTIVEE;
    }

    const dossierNonArchive = this.items.find((d) => !d.archive);
    if (dossierNonArchive.estExpire()) return Dossiers.EXPIREE;

    // TODO: definir le cas bientot-activee explicitement, et renvoyer non-realisée dans les autres cas
    return Dossiers.BIENTOT_ACTIVEE;
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

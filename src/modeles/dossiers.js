import Dossier from './dossier.js';
import ElementsConstructibles from './elementsConstructibles.js';
import {
  ErreurDossiersInvalides,
  ErreurDossierNonFinalisable,
  ErreurDossierCourantInexistant,
} from '../erreurs.js';
import * as Referentiel from '../referentiel.js';
import { dateEnFrancais } from '../utilitaires/date.js';

const STATUTS_HOMOLOGATION = {
  NON_REALISEE: 'nonRealisee',
  ACTIVEE: 'activee',
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

  archives() {
    return this.items
      .filter((i) => i.archive)
      .sort(
        (a, b) =>
          new Date(b.dateProchaineHomologation()) -
          new Date(a.dateProchaineHomologation())
      );
  }

  aUnDossierEnCoursDeValidite() {
    const dossierActif = this.dossierActif();

    if (!dossierActif) return false;
    const statut = dossierActif.statutHomologation();
    return statut === Dossiers.ACTIVEE || statut === Dossiers.BIENTOT_EXPIREE;
  }

  dateExpiration() {
    if (!this.dossierActif()) {
      return undefined;
    }
    return dateEnFrancais(this.dossierActif().dateProchaineHomologation());
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

  finaliseDossierCourant(indiceCyber, indiceCyberPersonnalise) {
    if (!this.dossierCourant())
      throw new ErreurDossierNonFinalisable(
        'Aucun dossier courant à finaliser'
      );

    this.items.forEach((dossier) => {
      if (dossier !== this.dossierCourant()) dossier.enregistreArchivage();
    });
    this.dossierCourant().enregistreFinalisation(
      indiceCyber,
      indiceCyberPersonnalise
    );
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
    if (this.aUnDossierEnCoursDeValidite()) return Dossiers.COMPLETES;
    return Dossiers.A_SAISIR;
  }

  supprimeDossierCourant() {
    const dossierCourant = this.dossierCourant();
    if (!dossierCourant)
      throw new ErreurDossierCourantInexistant(
        'Les dossiers ne comportent pas de dossier courant'
      );
    this.items = this.items.filter((d) => d !== dossierCourant);
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

export default Dossiers;

import Dossier, { DonneesDossier } from './dossier.js';
import ElementsConstructibles from './elementsConstructibles.js';

import {
  ErreurDossiersInvalides,
  ErreurDossierNonFinalisable,
  ErreurDossierCourantInexistant,
} from '../erreurs.js';
import { dateEnFrancais } from '../utilitaires/date.js';
import { Referentiel } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

type StatutHomologation =
  | 'nonRealisee'
  | 'activee'
  | 'expiree'
  | 'bientotExpiree';

type DonneesDossiers = {
  dossiers: DonneesDossier[];
};

class Dossiers extends ElementsConstructibles<Dossier> {
  constructor(
    donnees: DonneesDossiers = { dossiers: [] },
    referentiel: Referentiel = creeReferentielVide()
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
          new Date(b.dateProchaineHomologation()).getTime() -
          new Date(a.dateProchaineHomologation()).getTime()
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
    return this.items.find((i) => !i.finalise) as Dossier;
  }

  dossierActif() {
    if (this.items.filter((dossier) => dossier.estActif()).length > 1)
      throw new ErreurDossiersInvalides(
        "Les dossiers ne peuvent pas avoir plus d'un dossier actif"
      );
    return this.items.find((dossier) => dossier.estActif()) as Dossier;
  }

  finaliseDossierCourant(indiceCyber: number, indiceCyberPersonnalise: number) {
    if (!this.dossierCourant())
      throw new ErreurDossierNonFinalisable(
        'Aucun dossier courant à finaliser',
        []
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

  static valide({ dossiers }: DonneesDossiers) {
    const nombreDossiersNonFinalises = dossiers.filter(
      (d) => !d.finalise
    ).length;

    if (nombreDossiersNonFinalises > 1) {
      throw new ErreurDossiersInvalides(
        "Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé"
      );
    }
  }

  static NON_REALISEE: StatutHomologation = 'nonRealisee';
  static ACTIVEE: StatutHomologation = 'activee';
  static EXPIREE: StatutHomologation = 'expiree';
  static BIENTOT_EXPIREE: StatutHomologation = 'bientotExpiree';
}

export default Dossiers;

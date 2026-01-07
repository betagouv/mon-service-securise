import { VersionService } from './versionService.js';

export type DonneesExplicationNouveauReferentiel = {
  dejaTermine: boolean;
  versionsService?: VersionService[];
  aVuTableauDeBordDepuisConnexion: boolean;
};

export class ExplicationNouveauReferentiel {
  private dejaTermine: boolean;
  readonly versionsService: VersionService[];
  aVuTableauDeBordDepuisConnexion: boolean;

  constructor(donnees: DonneesExplicationNouveauReferentiel) {
    this.dejaTermine = donnees?.dejaTermine;
    this.versionsService = donnees?.versionsService || [];
    this.aVuTableauDeBordDepuisConnexion =
      donnees?.aVuTableauDeBordDepuisConnexion;
  }

  estTermine(): boolean {
    return this.dejaTermine;
  }

  finalise() {
    this.dejaTermine = true;
  }

  toJSON() {
    return {
      dejaTermine: this.dejaTermine,
    };
  }

  doitEtreAffichee() {
    return (
      !this.dejaTermine &&
      !this.aVuTableauDeBordDepuisConnexion &&
      this.versionsService.includes(VersionService.v1)
    );
  }
}

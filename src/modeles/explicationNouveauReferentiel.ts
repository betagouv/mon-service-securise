import { VersionService } from './versionService.js';

export class ExplicationNouveauReferentiel {
  private dejaTermine: boolean;
  private versionsService: VersionService[];
  aVuTableauDeBordDepuisConnexion: boolean;

  constructor(donnees: {
    dejaTermine: boolean;
    versionsService: VersionService[];
    aVuTableauDeBordDepuisConnexion: boolean;
  }) {
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
      aVuTableauDeBordDepuisConnexion: this.aVuTableauDeBordDepuisConnexion,
    };
  }

  doitEtreAffichee() {
    return (
      this.dejaTermine === false &&
      !this.aVuTableauDeBordDepuisConnexion &&
      this.versionsService.includes(VersionService.v1)
    );
  }
}

import { VersionService } from './versionService.js';

export class ExplicationNouveauReferentiel {
  private dejaTermine: boolean;
  private versionsService: VersionService[];

  constructor(donnees: {
    dejaTermine: boolean;
    versionsService: VersionService[];
  }) {
    this.dejaTermine = donnees?.dejaTermine;
    this.versionsService = donnees?.versionsService || [];
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
      this.dejaTermine === false &&
      this.versionsService.includes(VersionService.v1)
    );
  }
}

export class ExplicationNouveauReferentiel {
  private dejaTermine: boolean;

  constructor(donnees: { dejaTermine: boolean }) {
    this.dejaTermine = donnees?.dejaTermine;
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
    return this.dejaTermine === false;
  }
}

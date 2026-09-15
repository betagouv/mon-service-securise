import Regle, { DonneesRegle } from './regle.js';

class Regles {
  private readonly regles: Regle[];

  constructor(regles: readonly Partial<DonneesRegle>[] = []) {
    this.regles = regles.map((regle) => new Regle(regle));
  }

  sontVides(): boolean {
    return this.regles.length === 0;
  }

  sontMultiples(): boolean {
    return this.regles.length > 1;
  }

  toutes(): Regle[] {
    return this.regles;
  }
}

export default Regles;

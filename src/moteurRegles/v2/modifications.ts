import { Modificateur } from './moteurReglesV2.js';

export class Modifications {
  private modificateurs: Modificateur[];

  constructor(private readonly dansSocleInitial: boolean) {
    this.modificateurs = [];
  }

  ajoute(modificateur: Modificateur) {
    this.modificateurs.push(modificateur);
  }

  doitAjouter() {
    const nonExclue =
      this.dansSocleInitial && !this.modificateurs.includes('Retirer');
    return nonExclue || this.modificateurs.includes('Ajouter');
  }

  rendreIndispensable() {
    return this.modificateurs.includes('RendreIndispensable');
  }
}

import { Referentiel } from './referentiel.interface.js';

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;

  constructor(referentiel: Referentiel) {
    this.referentiel = referentiel;
  }

  // eslint-disable-next-line class-methods-use-this
  mesures() {
    return [];
  }
}

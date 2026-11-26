import { CritereRegle } from '../../referentiel.types.js';

export type DonneesRegle = {
  presence: readonly CritereRegle[];
  absence: readonly CritereRegle[];
};

class Regle {
  readonly presence: readonly CritereRegle[];
  readonly absence: readonly CritereRegle[];

  constructor({ presence, absence }: Partial<DonneesRegle> = {}) {
    this.presence = presence || [];
    this.absence = absence || [];
  }
}

export default Regle;

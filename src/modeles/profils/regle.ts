import { CritereRegle } from '../../referentiel.types.js';

export type DonneesRegle = {
  presence: CritereRegle[];
  absence: CritereRegle[];
};

class Regle {
  readonly presence: CritereRegle[];
  readonly absence: CritereRegle[];

  constructor({ presence, absence }: Partial<DonneesRegle> = {}) {
    this.presence = presence || [];
    this.absence = absence || [];
  }
}

export default Regle;

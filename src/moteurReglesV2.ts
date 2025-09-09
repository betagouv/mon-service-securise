import { Referentiel } from './referentiel.interface.js';

type IdMesureV2 = string;

type LigneDeMenu = {
  reference: IdMesureV2;
  dansSocleInitial: boolean;
};

export type MenuMoteurDeReglesV2 = LigneDeMenu[];

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;
  private readonly menu: MenuMoteurDeReglesV2;

  constructor(referentiel: Referentiel, menu: MenuMoteurDeReglesV2) {
    this.referentiel = referentiel;
    this.menu = menu;
  }

  mesures() {
    const mesures = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const ligne of this.menu) {
      if (ligne.dansSocleInitial) {
        mesures.push([ligne.reference, {}]);
      }
    }

    return Object.fromEntries(mesures);
  }
}

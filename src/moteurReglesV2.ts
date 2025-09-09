import { Referentiel } from './referentiel.interface.js';
import { DescriptionServiceV2 } from './modeles/descriptionServiceV2.js';

type IdMesureV2 = string;
export enum Modificateur {
  RendreIndispensable,
}
type LigneDeMenu = {
  reference: IdMesureV2;
  dansSocleInitial: boolean;
  modificateurs: Record<string, [string, Modificateur]>;
};

export type MenuMoteurDeReglesV2 = LigneDeMenu[];

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;
  private readonly menu: MenuMoteurDeReglesV2;

  constructor(referentiel: Referentiel, menu: MenuMoteurDeReglesV2) {
    this.referentiel = referentiel;
    this.menu = menu;
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const ligne of this.menu) {
      if (ligne.dansSocleInitial) {
        const modifiee: { indispensable?: boolean } = {};

        if (
          ligne.modificateurs.niveauDeSecurite &&
          descriptionService.niveauDeSecurite ===
            ligne.modificateurs.niveauDeSecurite[0]
        )
          modifiee.indispensable = true;

        mesures.push([ligne.reference, modifiee]);
      }
    }

    return Object.fromEntries(mesures);
  }
}

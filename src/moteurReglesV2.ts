import { Referentiel } from './referentiel.interface.js';
import { DescriptionServiceV2 } from './modeles/descriptionServiceV2.js';

type IdMesureV2 = string;
export enum Modificateur {
  RendreIndispensable,
  RendreRecommandee,
  Ajouter,
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
      let aRajouter = false;
      const modifiee: { indispensable: boolean } = { indispensable: false };

      if (ligne.dansSocleInitial) aRajouter = true;

      if (
        ligne.modificateurs.niveauDeSecurite &&
        descriptionService.niveauDeSecurite ===
          ligne.modificateurs.niveauDeSecurite[0]
      )
        switch (ligne.modificateurs.niveauDeSecurite[1]) {
          case Modificateur.RendreIndispensable:
            modifiee.indispensable = true;
            break;
          case Modificateur.RendreRecommandee:
            modifiee.indispensable = false;
            break;
          case Modificateur.Ajouter:
            aRajouter = true;
            break;
          default:
            break;
        }
      if (aRajouter) mesures.push([ligne.reference, modifiee]);
    }

    return Object.fromEntries(mesures);
  }
}

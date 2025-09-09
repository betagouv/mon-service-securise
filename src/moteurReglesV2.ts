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
      const modifiee: { aRajouter?: boolean; indispensable: boolean } = {
        indispensable: false,
      };

      modifiee.aRajouter = ligne.dansSocleInitial;

      const champ = Object.keys(ligne.modificateurs)[0];

      if (champ) {
        const [valeurMenu, modificateur] = ligne.modificateurs[champ];
        const enRecord = descriptionService as unknown as Record<
          string,
          string
        >;
        const valeurReelle = enRecord[champ] as string;

        if (valeurReelle === valeurMenu)
          switch (modificateur) {
            case Modificateur.RendreIndispensable:
              modifiee.indispensable = true;
              break;
            case Modificateur.RendreRecommandee:
              modifiee.indispensable = false;
              break;
            case Modificateur.Ajouter:
              modifiee.aRajouter = true;
              break;
            default:
              break;
          }
      }

      if (modifiee.aRajouter)
        mesures.push([
          ligne.reference,
          { indispensable: modifiee.indispensable },
        ]);
    }

    return Object.fromEntries(mesures);
  }
}

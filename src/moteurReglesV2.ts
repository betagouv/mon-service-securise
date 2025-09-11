import { Referentiel } from './referentiel.interface.js';
import { DescriptionServiceV2 } from './modeles/descriptionServiceV2.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';

type IdMesureV2 = keyof typeof mesuresV2;

export enum Modificateur {
  RendreIndispensable,
  RendreRecommandee,
  Ajouter,
}

export type RegleDuReferentielV2 = {
  reference: IdMesureV2;
  dansSocleInitial: boolean;
  modificateurs: Record<string, [string, Modificateur]>;
};

export type ReglesDuReferentielMesuresV2 = RegleDuReferentielV2[];

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;
  private readonly menu: ReglesDuReferentielMesuresV2;

  constructor(referentiel: Referentiel, menu: ReglesDuReferentielMesuresV2) {
    this.referentiel = referentiel;
    this.menu = menu;
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const ligne of this.menu) {
      const modification = this.evalueLigne(ligne, descriptionService);

      if (modification.aRajouter)
        mesures.push([
          ligne.reference,
          { indispensable: modification.indispensable },
        ]);
    }

    return Object.fromEntries(mesures);
  }

  // eslint-disable-next-line class-methods-use-this
  private evalueLigne(
    ligne: RegleDuReferentielV2,
    descriptionService: DescriptionServiceV2
  ) {
    type ModificationMesure = { aRajouter?: boolean; indispensable: boolean };

    const modification: ModificationMesure = { indispensable: false };

    modification.aRajouter = ligne.dansSocleInitial;

    const champ = Object.keys(ligne.modificateurs)[0];
    if (champ) {
      const [valeurMenu, modificateur] = ligne.modificateurs[champ];
      const enRecord = descriptionService as unknown as Record<string, string>;
      const valeurReelle = enRecord[champ] as string;

      if (valeurReelle === valeurMenu)
        switch (modificateur) {
          case Modificateur.RendreIndispensable:
            modification.indispensable = true;
            break;
          case Modificateur.RendreRecommandee:
            modification.indispensable = false;
            break;
          case Modificateur.Ajouter:
            modification.aRajouter = true;
            break;
          default:
            break;
        }
    }

    return modification;
  }
}

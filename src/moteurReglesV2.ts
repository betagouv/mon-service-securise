import { Referentiel } from './referentiel.interface.js';
import { DescriptionServiceV2 } from './modeles/descriptionServiceV2.js';
import { mesuresV2 } from '../donneesReferentielMesuresV2.js';

type IdMesureV2 = keyof typeof mesuresV2;

export enum Modificateur {
  RendreIndispensable,
  RendreRecommandee,
  Ajouter,
  Retirer,
}

export type RegleDuReferentielV2 = {
  reference: IdMesureV2;
  dansSocleInitial: boolean;
  modificateurs: Record<string, [string, Modificateur][]>;
};

export type ReglesDuReferentielMesuresV2 = RegleDuReferentielV2[];

class Modifications {
  private modificateurs: Modificateur[];

  constructor(private readonly dansSocleInitial: boolean) {
    this.modificateurs = [];
  }

  ajoute(modificateur: Modificateur) {
    this.modificateurs.push(modificateur);
  }

  doitAjouter() {
    const nonExclue =
      this.dansSocleInitial &&
      !this.modificateurs.includes(Modificateur.Retirer);
    return nonExclue || this.modificateurs.includes(Modificateur.Ajouter);
  }

  rendreIndispensable() {
    return this.modificateurs.includes(Modificateur.RendreIndispensable);
  }
}

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;
  private readonly menu: ReglesDuReferentielMesuresV2;

  constructor(referentiel: Referentiel, menu: ReglesDuReferentielMesuresV2) {
    this.referentiel = referentiel;
    this.menu = menu;
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    const descriptionEnRecord = descriptionService as unknown as Record<
      string,
      string
    >;

    // eslint-disable-next-line no-restricted-syntax
    for (const ligne of this.menu) {
      const modifications = this.evalueLigne(ligne, descriptionEnRecord);

      if (modifications.doitAjouter())
        mesures.push([
          ligne.reference,
          { indispensable: modifications.rendreIndispensable() },
        ]);
    }

    return Object.fromEntries(mesures);
  }

  // eslint-disable-next-line class-methods-use-this
  private evalueLigne(
    ligne: RegleDuReferentielV2,
    descriptionService: Record<string, string>
  ): Modifications {
    const collecte = new Modifications(ligne.dansSocleInitial);

    Object.keys(ligne.modificateurs).forEach((champDeDecrire) => {
      const modifications = ligne.modificateurs[champDeDecrire];
      for (let i = 0; i < modifications.length; i += 1) {
        const [valeurRegle, modificateur] = modifications[i];
        const valeurReelle = descriptionService[champDeDecrire] as string;
        if (valeurReelle === valeurRegle) collecte.ajoute(modificateur);
      }
    });

    return collecte;
  }
}

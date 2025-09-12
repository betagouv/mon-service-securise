import { Referentiel } from '../../referentiel.interface.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { mesuresV2 } from '../../../donneesReferentielMesuresV2.js';
import { Modifications } from './modifications.js';

export type IdMesureV2 = keyof typeof mesuresV2;

export type Modificateur =
  | 'RendreIndispensable'
  | 'RendreRecommandee'
  | 'Ajouter'
  | 'Retirer';

export type CaracteristiquesDuService =
  | 'niveauDeSecurite'
  | 'categorieDonneesTraitees';

export type ModificateursDeRegles = Partial<
  Record<CaracteristiquesDuService, [string, Modificateur][]>
>;

export type RegleDuReferentielV2 = {
  reference: IdMesureV2;
  dansSocleInitial: boolean;
  modificateurs: ModificateursDeRegles;
};

export type ReglesDuReferentielMesuresV2 = RegleDuReferentielV2[];

export class MoteurReglesV2 {
  private readonly referentiel: Referentiel;
  private readonly regles: ReglesDuReferentielMesuresV2;

  constructor(referentiel: Referentiel, regles: ReglesDuReferentielMesuresV2) {
    this.referentiel = referentiel;
    this.regles = regles;
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    const descriptionEnRecord = descriptionService as unknown as Record<
      string,
      string
    >;

    // eslint-disable-next-line no-restricted-syntax
    for (const ligne of this.regles) {
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
      const modifications =
        ligne.modificateurs[champDeDecrire as CaracteristiquesDuService];
      for (let i = 0; i < modifications!.length; i += 1) {
        const [valeurRegle, modificateur] = modifications![i];
        const valeurReelle = descriptionService[champDeDecrire] as string;
        if (valeurReelle === valeurRegle) collecte.ajoute(modificateur);
      }
    });

    return collecte;
  }
}

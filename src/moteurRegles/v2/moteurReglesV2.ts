import { Referentiel } from '../../referentiel.interface.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { mesuresV2 } from '../../../donneesReferentielMesuresV2.js';
import { RegleV2 } from './regleV2.js';

export type IdMesureV2 = keyof typeof mesuresV2;

export type Modificateur =
  | 'RendreIndispensable'
  | 'RendreRecommandee'
  | 'Ajouter'
  | 'Retirer';

export type CaracteristiquesDuService =
  | 'niveauDeSecurite'
  | 'categoriesDonneesTraitees';

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
  private readonly regles: RegleV2[];

  constructor(referentiel: Referentiel, regles: ReglesDuReferentielMesuresV2) {
    this.referentiel = referentiel;
    this.regles = regles.map(
      (r) => new RegleV2(r.reference, r.dansSocleInitial, r.modificateurs)
    );
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    const descriptionEnRecord = descriptionService as unknown as Record<
      string,
      string
    >;

    // eslint-disable-next-line no-restricted-syntax
    for (const regle of this.regles) {
      const modifications = regle.evalue(descriptionEnRecord);
      if (modifications.doitAjouter())
        mesures.push([
          regle.reference,
          {
            indispensable: modifications.rendreIndispensable(),
            ...this.referentiel.mesureV2AvecID(regle.reference),
          },
        ]);
    }

    return Object.fromEntries(mesures);
  }
}

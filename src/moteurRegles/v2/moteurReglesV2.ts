import { Referentiel } from '../../referentiel.interface.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import {
  ActiviteExternalisee,
  mesuresV2,
  SpecificiteProjet,
  TypeDeService,
  TypeHebergement,
} from '../../../donneesReferentielMesuresV2.js';
import { RegleV2 } from './regleV2.js';
import { NiveauCriticite } from './niveauSecurite.js';

export type IdMesureV2 = keyof typeof mesuresV2;

export type Modificateur =
  | 'RendreIndispensable'
  | 'RendreRecommandee'
  | 'Ajouter'
  | 'Retirer';

export type CaracteristiquesDuService =
  | 'niveauDeSecurite'
  | 'categoriesDonneesTraitees';

export type ProjectionDescriptionPourMoteur = {
  criticiteDonneesTraitees: NiveauCriticite;
  donneesHorsUE: boolean;
  criticiteDisponibilite: NiveauCriticite;
  criticiteOuverture: NiveauCriticite;
  specificitesProjet: SpecificiteProjet[];
  typeService: TypeDeService[];
  activitesExternalisees: ActiviteExternalisee | 'LesDeux';
  typeHebergement: TypeHebergement;
};

export type ModificateursDeRegles = Partial<
  Record<CaracteristiquesDuService, [string, Modificateur][]>
>;

export type ModificateurPourBesoin =
  | 'Indispensable'
  | 'Recommandée'
  | 'Absente';

export type BesoinsDeSecurite = {
  niveau1: ModificateurPourBesoin;
  niveau2: ModificateurPourBesoin;
  niveau3: ModificateurPourBesoin;
};

export type RegleDuReferentielV2 = {
  reference: IdMesureV2;
  besoinsDeSecurite: BesoinsDeSecurite;
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
      (r) =>
        new RegleV2(
          r.reference,
          r.besoinsDeSecurite,
          r.dansSocleInitial,
          r.modificateurs
        )
    );
  }

  mesures(descriptionService: DescriptionServiceV2) {
    const mesures = [];

    const descriptionEnRecord = descriptionService as unknown as Record<
      string,
      string
    >;

    const niveauDuService = descriptionService.niveauDeSecurite;
    const reglesDeBase = this.regles.filter((r) =>
      r.estPourNiveau(niveauDuService)
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const regle of reglesDeBase) {
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

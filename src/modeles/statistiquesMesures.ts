import Mesure, { StatutMesure } from './mesure.js';
import MesuresGenerales from './mesuresGenerales.js';
import { TousReferentiels } from '../referentiel.interface.js';
import {
  IdCategorieMesure,
  IdReferentielMesure,
} from '../referentiel.types.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

type TypeMesure = 'indispensables' | 'recommandees';

type ParStatut = Record<StatutMesure, number>;

export type StatistiquesDUneCategorie = ParStatut & { sansStatut: number };

export type StatistiquesDUnType = ParStatut & {
  total: number;
  restant: number;
  aRemplir: number;
};

export type StatistiquesDUnTypeEtDUneCategorie = StatistiquesDUneCategorie & {
  total: number;
};

type ParCategorie<T> = Record<IdCategorieMesure, T>;

export type MesurePersonnalisee = {
  description: string;
  categorie: IdCategorieMesure;
  referentiel: IdReferentielMesure;
  indispensable?: boolean;
};

export type MesureSpecifiqueAComptabiliser = {
  categorie: string;
  statut?: string;
};

export type DonneesStatistiquesMesures = {
  mesuresGenerales: MesuresGenerales<IdMesureV1 | IdMesureV2>;
  mesuresPersonnalisees: Record<string, MesurePersonnalisee>;
  mesuresSpecifiques?: MesureSpecifiqueAComptabiliser[];
};

type MesureAComptabiliser = {
  categorie: IdCategorieMesure;
  statut?: string;
  type: TypeMesure;
};

const statutsAZero = (referentiel: TousReferentiels) =>
  Object.fromEntries(
    Object.keys(referentiel.statutsMesures()).map((statut) => [statut, 0])
  ) as ParStatut;

const parCategorieAZero = <T extends object>(
  referentiel: TousReferentiels,
  complementaires: T
) =>
  Object.fromEntries(
    referentiel
      .identifiantsCategoriesMesures()
      .map((categorie) => [
        categorie,
        { ...complementaires, ...statutsAZero(referentiel) },
      ])
  ) as ParCategorie<T & ParStatut>;

class StatistiquesMesures {
  private readonly parCategorie: ParCategorie<StatistiquesDUneCategorie>;
  private readonly parType: Record<TypeMesure, StatistiquesDUnType>;
  private readonly parTypeEtParCategorie: Record<
    TypeMesure,
    ParCategorie<StatistiquesDUnTypeEtDUneCategorie>
  >;

  readonly toutesCategories: StatistiquesDUneCategorie;

  static valide(
    {
      mesuresPersonnalisees,
    }: Pick<DonneesStatistiquesMesures, 'mesuresPersonnalisees'>,
    referentiel: TousReferentiels
  ) {
    referentiel.verifieCategoriesMesuresSontRepertoriees(
      Object.values(mesuresPersonnalisees).map((m) => m.categorie)
    );
  }

  constructor(
    {
      mesuresGenerales,
      mesuresPersonnalisees,
      mesuresSpecifiques = [],
    }: DonneesStatistiquesMesures,
    referentiel: TousReferentiels,
    exclueMesuresNonPrisesEnCompte?: boolean
  ) {
    StatistiquesMesures.valide({ mesuresPersonnalisees }, referentiel);

    this.parCategorie = parCategorieAZero(referentiel, { sansStatut: 0 });
    const complementairesParType = () => ({
      total: 0,
      restant: 0,
      aRemplir: 0,
    });
    this.parType = {
      indispensables: {
        ...complementairesParType(),
        ...statutsAZero(referentiel),
      },
      recommandees: {
        ...complementairesParType(),
        ...statutsAZero(referentiel),
      },
    };
    this.toutesCategories = { sansStatut: 0, ...statutsAZero(referentiel) };
    this.parTypeEtParCategorie = {
      indispensables: parCategorieAZero(referentiel, {
        sansStatut: 0,
        total: 0,
      }),
      recommandees: parCategorieAZero(referentiel, {
        sansStatut: 0,
        total: 0,
      }),
    };

    const estPriseEnCompte = ({ statut }: MesureAComptabiliser) =>
      !exclueMesuresNonPrisesEnCompte || statut !== Mesure.STATUT_NON_FAIT;

    const mesuresGeneralesAComptabiliser = Object.entries(
      mesuresPersonnalisees
    ).map(([id, { categorie, indispensable }]): MesureAComptabiliser => ({
      categorie,
      statut: mesuresGenerales.avecId(id as IdMesureV1 | IdMesureV2)?.statut,
      type: indispensable ? 'indispensables' : 'recommandees',
    }));
    const mesuresSpecifiquesAComptabiliser = mesuresSpecifiques.map(
      ({ categorie, statut }): MesureAComptabiliser => ({
        categorie: categorie as IdCategorieMesure,
        statut,
        // Les mesures spécifiques sont comptées au même titre que les mesures recommandées
        type: 'recommandees',
      })
    );

    [...mesuresGeneralesAComptabiliser, ...mesuresSpecifiquesAComptabiliser]
      .filter(estPriseEnCompte)
      .forEach((mesure) => this.comptabilise(mesure));
  }

  private comptabilise({ categorie, statut, type }: MesureAComptabiliser) {
    const statsDuType = this.parType[type];
    const statsDuTypeEtDeLaCategorie =
      this.parTypeEtParCategorie[type][categorie];

    statsDuType.total += 1;
    statsDuTypeEtDeLaCategorie.total += 1;

    if (Mesure.statutRenseigne(statut)) {
      this.parCategorie[categorie][statut] += 1;
      this.toutesCategories[statut] += 1;
      statsDuType[statut] += 1;
      statsDuTypeEtDeLaCategorie[statut] += 1;
    } else {
      this.parCategorie[categorie].sansStatut += 1;
      this.toutesCategories.sansStatut += 1;
    }

    if (statut !== Mesure.STATUT_FAIT) statsDuType.restant += 1;

    if (!statut) {
      statsDuType.aRemplir += 1;
      statsDuTypeEtDeLaCategorie.sansStatut += 1;
    }
  }

  aLancer(idCategorie: IdCategorieMesure): number {
    return this.parCategorie[idCategorie].aLancer;
  }

  faites(idCategorie: IdCategorieMesure): number {
    return this.parCategorie[idCategorie].fait;
  }

  enCours(idCategorie: IdCategorieMesure): number {
    return this.parCategorie[idCategorie].enCours;
  }

  nonFaites(idCategorie: IdCategorieMesure): number {
    return this.parCategorie[idCategorie].nonFait;
  }

  sansStatut(idCategorie: IdCategorieMesure): number {
    return this.parCategorie[idCategorie].sansStatut;
  }

  sansStatutToutesCategories(): number {
    return this.toutesCategories.sansStatut;
  }

  indispensables(): StatistiquesDUnType {
    return this.parType.indispensables;
  }

  recommandees(): StatistiquesDUnType {
    return this.parType.recommandees;
  }

  totauxParTypeEtParCategorie() {
    return this.parTypeEtParCategorie;
  }

  totauxParCategorie() {
    return this.toutesCategories;
  }
}

export { StatistiquesMesures };

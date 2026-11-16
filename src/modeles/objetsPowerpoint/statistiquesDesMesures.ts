import Service from '../service.js';
import { IdCategorieMesure } from '../../referentiel.types.js';
import { StatutMesure } from '../mesure.js';

export type RepartitionParStatut = Record<StatutMesure | 'sansStatut', number>;

export type MesuresDUnNiveauDeCriticite = RepartitionParStatut & {
  restant: number;
};

export type MesuresDUneCategorie = RepartitionParStatut & {
  libelle: string;
  total: number;
};

export type StatistiquesDesMesures = {
  nombreDeMesuresGenerales: number;
  nombreDeMesuresSpecifiques: number;
  referentiels: string;
  parCriticite: {
    indispensables: MesuresDUnNiveauDeCriticite;
    recommandees: MesuresDUnNiveauDeCriticite;
  };
  parCategorie: MesuresDUneCategorie[];
};

type StatistiquesDUnType = RepartitionParStatut & {
  aRemplir: number;
  restant: number;
};

const mesuresDUnNiveauDeCriticite = ({
  fait,
  enCours,
  nonFait,
  aLancer,
  aRemplir,
  restant,
}: StatistiquesDUnType): MesuresDUnNiveauDeCriticite => ({
  fait,
  enCours,
  nonFait,
  aLancer,
  sansStatut: aRemplir,
  restant,
});

export const statistiquesDesMesures = (
  service: Service
): StatistiquesDesMesures => {
  const statistiques = service.statistiquesMesuresGenerales();
  return {
    nombreDeMesuresGenerales: service.nombreTotalMesuresGenerales(),
    nombreDeMesuresSpecifiques: service.nombreMesuresSpecifiques(),
    referentiels: service.referentielsDesMesuresGenerales(),
    parCriticite: {
      indispensables: mesuresDUnNiveauDeCriticite(
        statistiques.indispensables()
      ),
      recommandees: mesuresDUnNiveauDeCriticite(statistiques.recommandees()),
    },
    parCategorie: (
      service.referentiel.identifiantsCategoriesMesures() as IdCategorieMesure[]
    ).map((categorie) => {
      const repartition: RepartitionParStatut = {
        fait: statistiques.faites(categorie),
        enCours: statistiques.enCours(categorie),
        nonFait: statistiques.nonFaites(categorie),
        aLancer: statistiques.aLancer(categorie),
        sansStatut: statistiques.sansStatut(categorie),
      };
      return {
        libelle: service.referentiel.descriptionCategorie(categorie),
        ...repartition,
        total: Object.values(repartition).reduce(
          (somme, nombre) => somme + nombre,
          0
        ),
      };
    }),
  };
};

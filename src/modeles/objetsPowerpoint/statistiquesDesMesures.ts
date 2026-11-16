import Service from '../service.js';
import { IdCategorieMesure } from '../../referentiel.types.js';
import { StatutMesure } from '../mesure.js';

export type RepartitionParStatut = Record<StatutMesure | 'aRemplir', number>;

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

type StatistiquesDUnNiveauDeCriticite = MesuresDUnNiveauDeCriticite & {
  total: number;
};

const sansLeTotal = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  total,
  ...mesures
}: StatistiquesDUnNiveauDeCriticite): MesuresDUnNiveauDeCriticite => mesures;

export const statistiquesDesMesures = (
  service: Service
): StatistiquesDesMesures => {
  const statistiques = service.statistiquesMesuresGenerales();
  return {
    nombreDeMesuresGenerales: service.nombreTotalMesuresGenerales(),
    nombreDeMesuresSpecifiques: service.nombreMesuresSpecifiques(),
    referentiels: service.referentielsDesMesuresGenerales(),
    parCriticite: {
      indispensables: sansLeTotal(statistiques.indispensables()),
      recommandees: sansLeTotal(statistiques.recommandees()),
    },
    parCategorie: (
      service.referentiel.identifiantsCategoriesMesures() as IdCategorieMesure[]
    ).map((categorie) => {
      const repartition: RepartitionParStatut = {
        fait: statistiques.faites(categorie),
        enCours: statistiques.enCours(categorie),
        nonFait: statistiques.nonFaites(categorie),
        aLancer: statistiques.aLancer(categorie),
        aRemplir: statistiques.sansStatut(categorie),
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

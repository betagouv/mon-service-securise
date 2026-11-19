import type { Knex } from 'knex';
import {
  libellesDepartements,
  libellesRegions,
  libellesSecteursActivite,
  libellesTypesOrganisation,
} from './libellesObservatoire.js';

export type ValeurFiltre = { valeur: string; libelle: string };

const valeursDisponibles = async (
  knex: Knex,
  colonne: string,
  libelles: Record<string, string>,
  ordre: 'parLibelle' | 'parValeur' = 'parLibelle'
): Promise<ValeurFiltre[]> => {
  const lignes = await knex('observatoire_mss_services_crees')
    .distinct(colonne)
    .whereNotNull(colonne);
  const valeurs: ValeurFiltre[] = lignes.map((ligne) => ({
    valeur: ligne[colonne],
    libelle: libelles[ligne[colonne]] ?? ligne[colonne],
  }));
  const cleDeTri = ordre === 'parLibelle' ? 'libelle' : 'valeur';
  return valeurs.sort((a, b) => a[cleDeTri].localeCompare(b[cleDeTri], 'fr'));
};

export const filtresDisponibles = async (knex: Knex) => ({
  regions: await valeursDisponibles(knex, 'region', libellesRegions),
  departements: await valeursDisponibles(
    knex,
    'departement',
    libellesDepartements,
    'parValeur'
  ),
  secteursActivite: await valeursDisponibles(
    knex,
    'secteur_activite',
    libellesSecteursActivite
  ),
  typesOrganisation: await valeursDisponibles(
    knex,
    'type_organisation',
    libellesTypesOrganisation,
    'parValeur'
  ),
});

export type FiltresObservatoire = {
  region?: string;
  departement?: string;
  secteurActivite?: string;
  typeOrganisation?: string;
};

const SERVICES_FILTRES = `
  SELECT id_hash
  FROM observatoire_mss_services_crees
  WHERE (:region::text IS NULL OR region = :region)
    AND (:departement::text IS NULL OR departement = :departement)
    AND (:secteurActivite::text IS NULL OR secteur_activite = :secteurActivite)
    AND (:typeOrganisation::text IS NULL OR type_organisation = :typeOrganisation)
`;

export const donneesObservatoire = async (
  knex: Knex,
  filtres: FiltresObservatoire
) => {
  const parametres = {
    region: filtres.region ?? null,
    departement: filtres.departement ?? null,
    secteurActivite: filtres.secteurActivite ?? null,
    typeOrganisation: filtres.typeOrganisation ?? null,
  };

  const requete = async <T>(sql: string): Promise<T[]> =>
    (await knex.raw(sql, parametres)).rows;

  const [{ totalServices }] = await requete<{ totalServices: number }>(`
    SELECT COUNT(*)::int AS "totalServices"
    FROM (${SERVICES_FILTRES}) AS services_filtres
  `);

  const cumulMensuelServices = await requete<{ mois: string; cumul: number }>(`
    WITH services AS (
      SELECT date_creation
      FROM observatoire_mss_services_crees
      WHERE id_hash IN (${SERVICES_FILTRES})
        AND date_creation IS NOT NULL
    ),
    bornes AS (
      SELECT date_trunc('month', MIN(date_creation)) AS premier_mois,
             date_trunc('month', MAX(date_creation)) AS dernier_mois
      FROM services
    ),
    mois AS (
      SELECT generate_series(premier_mois, dernier_mois, interval '1 month') AS mois
      FROM bornes
    ),
    crees_par_mois AS (
      SELECT date_trunc('month', date_creation) AS mois, COUNT(*) AS nombre
      FROM services
      GROUP BY 1
    )
    SELECT to_char(mois.mois, 'YYYY-MM') AS mois,
           (SUM(COALESCE(crees_par_mois.nombre, 0)) OVER (ORDER BY mois.mois))::int AS cumul
    FROM mois
    LEFT JOIN crees_par_mois ON crees_par_mois.mois = mois.mois
    ORDER BY mois.mois
  `);

  const mesuresFaitesParMois = await requete<{ mois: string; total: number }>(`
    SELECT to_char(date - interval '1 month', 'YYYY-MM') AS mois,
           SUM(total_faites)::int AS total
    FROM observatoire_mss_mesures_faites
    WHERE id_hash_service IN (${SERVICES_FILTRES})
    GROUP BY date
    ORDER BY date
  `);

  const servicesParNiveauSecurite = await requete<{
    niveauSecurite: string;
    total: number;
  }>(`
    SELECT niveau_securite AS "niveauSecurite",
           COUNT(*)::int AS total
    FROM observatoire_mss_services_crees
    WHERE id_hash IN (${SERVICES_FILTRES})
      AND niveau_securite IS NOT NULL
    GROUP BY niveau_securite
    ORDER BY CASE niveau_securite
               WHEN 'Élémentaires' THEN 1
               WHEN 'Modérés' THEN 2
               WHEN 'Importants' THEN 3
             END
  `);

  const cumulMensuelHomologations = await requete<{
    mois: string;
    cumul: number;
  }>(`
    SELECT to_char(date - interval '1 month', 'YYYY-MM') AS mois,
           SUM(total_realisees)::int AS cumul
    FROM observatoire_mss_homologations_realisees
    WHERE id_hash_service IN (${SERVICES_FILTRES})
    GROUP BY date
    ORDER BY date
  `);

  const [{ dateDerniereExecution }] = await knex(
    'observatoire_mss_executions'
  ).max('date_execution as dateDerniereExecution');

  return {
    totalServices,
    cumulMensuelServices,
    mesuresFaitesParMois,
    servicesParNiveauSecurite,
    cumulMensuelHomologations,
    dateDerniereExecution: dateDerniereExecution ?? null,
    filtresDisponibles: await filtresDisponibles(knex),
  };
};

import Knex from 'knex';
import * as uuid from 'uuid';
import { journalMSS } from './adaptateurEnvironnement.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
  EvolutionMensuelle,
} from './adaptateurJournalMSS.interface.js';

export class AdaptateurJournalMSSPostgres implements AdaptateurJournalMSS {
  private readonly knex: Knex.Knex;

  constructor(knex?: Knex.Knex) {
    this.knex =
      knex ??
      Knex({
        client: 'pg',
        connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
        pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
      });
  }

  private async evolutionCumuleeParGroupe(
    idsServicesHaches: Array<string>,
    groupes: Array<string>
  ) {
    if (idsServicesHaches.length === 0) return [];

    const { rows } = await this.knex.raw(
      `WITH groupes AS (SELECT *
                        FROM unnest(:idsServicesHaches::text[], :groupes::text[]) AS t(id_service, groupe)),
            premieresCreations AS (SELECT date_trunc('month', MIN(evenements.date)) AS mois
                                   FROM journal_mss.evenements
                                            JOIN groupes ON groupes.id_service = evenements.donnees ->> 'idService'
                                   WHERE evenements.type = 'NOUVEAU_SERVICE_CREE'
                                   GROUP BY groupes.groupe),
            creations AS (SELECT mois, COUNT(*) AS nombre
                          FROM premieresCreations
                          GROUP BY mois),
            tousLesMois AS (SELECT generate_series((SELECT MIN(mois) FROM creations),
                                                   (SELECT MAX(mois) FROM creations),
                                                   '1 month') AS mois)
       SELECT to_char(tousLesMois.mois, 'YYYY-MM')                                       AS mois,
              (SUM(COALESCE(creations.nombre, 0)) OVER (ORDER BY tousLesMois.mois))::int AS total
       FROM tousLesMois
                LEFT JOIN creations USING (mois)
       ORDER BY tousLesMois.mois`,
      { idsServicesHaches, groupes }
    );

    return rows as EvolutionMensuelle;
  }

  async evolutionNombreServices(idsServicesHaches: Array<string>) {
    return this.evolutionCumuleeParGroupe(idsServicesHaches, idsServicesHaches);
  }

  async evolutionNombreOrganisations(
    services: Array<{ idServiceHache: string; siretHache: string }>
  ) {
    return this.evolutionCumuleeParGroupe(
      services.map(({ idServiceHache }) => idServiceHache),
      services.map(({ siretHache }) => siretHache)
    );
  }

  async consigneEvenement(evenement: EvenementJournal) {
    const { type, donnees, date } = evenement;

    await this.knex('journal_mss.evenements').insert({
      id: uuid.v4(),
      type,
      donnees,
      date: new Date(date).toISOString(),
    });
  }
}

import Knex from 'knex';
import * as uuid from 'uuid';
import { journalMSS } from './adaptateurEnvironnement.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
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

  async evolutionNombreServices(idsServicesHaches: Array<string>) {
    if (idsServicesHaches.length === 0) return [];

    const { rows } = await this.knex.raw(
      `WITH creations AS (SELECT date_trunc('month', date) AS mois, COUNT(*) AS nombre
                          FROM journal_mss.evenements
                          WHERE type = 'NOUVEAU_SERVICE_CREE'
                            AND donnees ->> 'idService' = ANY (:idsServicesHaches)
                          GROUP BY 1),
            tousLesMois AS (SELECT generate_series((SELECT MIN(mois) FROM creations),
                                                   (SELECT MAX(mois) FROM creations),
                                                   '1 month') AS mois)
       SELECT to_char(tousLesMois.mois, 'YYYY-MM')                                          AS mois,
              (SUM(COALESCE(creations.nombre, 0)) OVER (ORDER BY tousLesMois.mois))::int    AS total
       FROM tousLesMois
                LEFT JOIN creations USING (mois)
       ORDER BY tousLesMois.mois`,
      { idsServicesHaches }
    );

    return rows as Array<{ mois: string; total: number }>;
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

import Knex from 'knex';
import * as uuid from 'uuid';
import { journalMSS } from './adaptateurEnvironnement.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from './adaptateurJournalMSS.interface.js';

export class AdaptateurJournalMSSPostgres implements AdaptateurJournalMSS {
  private readonly knex: Knex.Knex;

  constructor() {
    this.knex = Knex({
      client: 'pg',
      connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
      pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
    });
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

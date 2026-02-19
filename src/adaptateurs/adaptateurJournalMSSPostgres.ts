import Knex from 'knex';
import * as uuid from 'uuid';
import { journalMSS } from './adaptateurEnvironnement.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from './adaptateurJournalMSS.interface.js';

const config = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
  pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
};

const nouvelAdaptateur = (): AdaptateurJournalMSS => {
  const knex = Knex(config);

  const consigneEvenement = async (evenement: EvenementJournal) => {
    const { type, donnees, date } = evenement;

    await knex('journal_mss.evenements').insert({
      id: uuid.v4(),
      type,
      donnees,
      date: new Date(date).toISOString(),
    });
  };

  return {
    consigneEvenement,
  };
};

export { nouvelAdaptateur };

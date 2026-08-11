import Knex from 'knex';
import { journalMSS } from '../adaptateurs/adaptateurEnvironnement.js';

// On veut un singleton de KnexJournal, donc on exporte une seule instance.
// Pour ne pas saturer le pool de connexion en appelant X fois `Knex()`.
export const knexJournalMSS = Knex({
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
  pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
});

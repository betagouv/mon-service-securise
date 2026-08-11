import { AdaptateurStatistiquesPostgres } from './adaptateurStatistiquesPostgres.js';
import { knexMSS } from '../bdd/knex.js';
import { knexJournalMSS } from '../bdd/knexJournal.js';
import { adaptateurStatistiquesMemoire } from './adaptateurStatistiquesMemoire.js';

const fabriqueAdaptateurStatistiques = () =>
  process.env.STATISTIQUES_PUBLIQUES_TYPE_ADAPTATEUR?.toLowerCase().trim() ===
  'postgres'
    ? new AdaptateurStatistiquesPostgres({
        knex: knexMSS,
        knexJournal: knexJournalMSS,
      })
    : adaptateurStatistiquesMemoire;

export default fabriqueAdaptateurStatistiques;

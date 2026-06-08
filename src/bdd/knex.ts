import Knex from 'knex';
import configurationKnex from '../../knexfile.js';

// On veut un singleton de Knex, donc on exporte une seule instance.
// Pour ne pas saturer le pool de connexion en appelant X fois `Knex()`.
export const knexMSS = Knex(configurationKnex);

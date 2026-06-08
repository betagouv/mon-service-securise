import { baseDeDonnees } from './src/adaptateurs/adaptateurEnvironnement.js';

export default {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES,
  pool: { min: 0, max: baseDeDonnees().poolMaximumConnexion() },
  migrations: { tableName: 'knex_migrations' },
};

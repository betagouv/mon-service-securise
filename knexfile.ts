import { baseDeDonnees } from './src/adaptateurs/adaptateurEnvironnement';

export const development = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES,
  pool: { min: 0, max: baseDeDonnees().poolMaximumConnexion() },
  migrations: { tableName: 'knex_migrations' },
};
export const production = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES,
  pool: { min: 0, max: baseDeDonnees().poolMaximumConnexion() },
  migrations: { tableName: 'knex_migrations' },
};

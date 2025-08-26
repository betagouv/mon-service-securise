import * as adaptateurEnvironnement from './src/adaptateurs/adaptateurEnvironnement.js';

const config = {
  development: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: {
      min: 0,
      max: adaptateurEnvironnement.baseDeDonnees().poolMaximumConnexion(),
    },
    migrations: { tableName: 'knex_migrations' },
  },

  production: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: {
      min: 0,
      max: adaptateurEnvironnement.baseDeDonnees().poolMaximumConnexion(),
    },
    migrations: { tableName: 'knex_migrations' },
  },
};

export default config;

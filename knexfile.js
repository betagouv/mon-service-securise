const { baseDeDonnees } = require('./src/adaptateurs/adaptateurEnvironnement');

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: { min: 0, max: baseDeDonnees().poolMaximumConnexion() },
    migrations: { tableName: 'knex_migrations' },
  },

  production: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: { min: 0, max: baseDeDonnees().poolMaximumConnexion() },
    migrations: { tableName: 'knex_migrations' },
  },
};

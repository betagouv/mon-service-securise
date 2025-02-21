const maxPool = Number.isNaN(
  parseInt(process.env.BASE_DONNEES_POOL_CONNEXION_MAX, 10)
)
  ? 10
  : parseInt(process.env.BASE_DONNEES_POOL_CONNEXION_MAX, 10);

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: { min: 0, max: maxPool },
    migrations: { tableName: 'knex_migrations' },
  },

  production: {
    client: 'pg',
    connection: process.env.URL_SERVEUR_BASE_DONNEES,
    pool: { min: 0, max: maxPool },
    migrations: { tableName: 'knex_migrations' },
  },
};

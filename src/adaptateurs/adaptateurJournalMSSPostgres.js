const Knex = require('knex');
const uuid = require('uuid');

const config = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations' },
};

const nouvelAdaptateur = () => {
  const knex = Knex(config);

  const consigneEvenement = (evenement) => {
    const { type, date } = evenement;

    const id = uuid.v4();
    const dateIso = new Date(date).toISOString();

    return knex('journal_mss.evenements').insert({ id, type, date: dateIso });
  };

  return {
    consigneEvenement,
  };
};

module.exports = { nouvelAdaptateur };

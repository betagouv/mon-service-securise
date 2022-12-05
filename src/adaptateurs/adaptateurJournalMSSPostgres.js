const Knex = require('knex');
const uuid = require('uuid');

const config = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
  pool: { min: 2, max: 10 },
};

const nouvelAdaptateur = () => {
  const knex = Knex(config);

  const consigneEvenement = (donneesEvenement) => {
    const { type, donnees, date } = donneesEvenement;

    return knex('journal_mss.evenements').insert({
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

module.exports = { nouvelAdaptateur };

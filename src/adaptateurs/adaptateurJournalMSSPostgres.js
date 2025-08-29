import Knex from 'knex';
import * as uuid from 'uuid';
import { journalMSS } from './adaptateurEnvironnement.js';

const config = {
  client: 'pg',
  connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
  pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
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

export { nouvelAdaptateur };

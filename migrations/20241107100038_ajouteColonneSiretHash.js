const services = 'services';
const nouvelleColonne = 'siret_hash';

export const up = (knex) =>
  knex.schema.alterTable(services, (table) => table.string(nouvelleColonne));

export const down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.dropColumn(nouvelleColonne)
  );

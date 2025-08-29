const services = 'services';
const nouvelleColonne = 'nom_service_hash';

export const up = (knex) =>
  knex.schema.alterTable(services, (table) => table.string(nouvelleColonne));

export const down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.dropColumn(nouvelleColonne)
  );

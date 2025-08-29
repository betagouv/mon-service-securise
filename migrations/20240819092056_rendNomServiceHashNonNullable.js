const services = 'services';
const nomColonne = 'nom_service_hash';

export const up = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.string(nomColonne).notNullable().alter()
  );

export const down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.string(nomColonne).nullable().alter()
  );

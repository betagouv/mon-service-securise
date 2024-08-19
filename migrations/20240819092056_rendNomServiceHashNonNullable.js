const services = 'services';
const nomColonne = 'nom_service_hash';

exports.up = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.string(nomColonne).notNullable().alter()
  );

exports.down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.string(nomColonne).nullable().alter()
  );

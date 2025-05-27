exports.up = (knex) =>
  knex.schema.alterTable('televersement_services', (table) => {
    table.integer('progression').defaultTo(0);
  });

exports.down = (knex) =>
  knex.schema.alterTable('televersement_services', (table) => {
    table.dropColumn('progression');
  });

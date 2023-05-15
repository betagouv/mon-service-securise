exports.up = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.datetime('date_creation').defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.dropColumn('date_creation');
  });

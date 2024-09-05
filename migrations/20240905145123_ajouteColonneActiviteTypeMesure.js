exports.up = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.string('type_mesure');
  });

exports.down = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.dropColumn('type_mesure');
  });

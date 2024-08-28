exports.up = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.string('id_mesure');
  });

exports.down = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.dropColumn('id_mesure');
  });

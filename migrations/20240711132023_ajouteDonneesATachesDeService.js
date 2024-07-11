exports.up = (knex) =>
  knex.schema.alterTable('taches_service', (table) => {
    table.json('donnees').defaultTo({});
  });

exports.down = (knex) =>
  knex.schema.alterTable('taches_service', (table) => {
    table.dropColumn('donnees');
  });

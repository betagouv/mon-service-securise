exports.up = (knex) =>
  knex.schema.createTable('parcours_utilisateurs', (table) => {
    table.uuid('id');
    table.primary('id');
    table.jsonb('donnees');
  });

exports.down = (knex) => knex.schema.dropTable('parcours_utilisateurs');

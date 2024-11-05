exports.up = (knex) =>
  knex.schema.createTable('superviseurs', (table) => {
    table.uuid('id_superviseur');
    table.text('siret_supervise');
    table.primary(['id_superviseur', 'siret_supervise']);
  });

exports.down = (knex) => knex.schema.dropTable('superviseurs');

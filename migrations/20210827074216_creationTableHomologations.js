exports.up = (knex) => (
  knex.schema.createTable('homologations', (table) => {
    table.uuid('id');
    table.primary('id');
    table.json('donnees');
  })
);

exports.down = (knex) => knex.schema.dropTable('homologations');

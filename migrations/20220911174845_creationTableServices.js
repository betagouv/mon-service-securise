exports.up = (knex) => knex.schema
  .createTable('services', (table) => {
    table.uuid('id');
    table.primary('id');
    table.json('donnees');
  });

exports.down = (knex) => knex.schema.dropTable('services');

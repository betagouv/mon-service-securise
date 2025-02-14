exports.up = (knex) =>
  knex.schema.createTable('sels_de_hachage', (table) => {
    table.integer('version');
    table.primary(['version']);
    table.text('empreinte');
    table.datetime('date_migration').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('sels_de_hachage');

exports.up = async (knex) =>
  knex.schema.createTable('taches_service', (table) => {
    table.uuid('id');
    table.primary('id');
    table.uuid('id_service');
    table.date('date_creation');
    table.string('nature');
    table.datetime('date_faite');
  });

exports.down = async (knex) => knex.schema.dropTable('taches_service');

exports.up = async (knex) =>
  knex.schema.createTable('notifications_expiration_homologation', (table) => {
    table.uuid('id');
    table.primary('id');
    table.uuid('id_service');
    table.datetime('date_prochain_envoi');
    table.integer('delai_avant_expiration_mois');
  });

exports.down = async (knex) =>
  knex.schema.dropTable('notifications_expiration_homologation');

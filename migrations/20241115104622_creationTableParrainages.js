exports.up = (knex) =>
  knex.schema.createTable('parrainages', (table) => {
    table.uuid('id_utilisateur_filleul');
    table.uuid('id_utilisateur_parrain');
    table.boolean('filleul_a_finalise_compte');
    table.primary(['id_utilisateur_filleul', 'id_utilisateur_parrain']);
  });

exports.down = (knex) => knex.schema.dropTable('parrainages');

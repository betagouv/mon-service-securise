const nomTable = 'televersement_modeles_mesure_specifique';

exports.up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_utilisateur');
    table.primary(['id_utilisateur']);
    table.jsonb('donnees');
  });

exports.down = (knex) => knex.schema.dropTable(nomTable);

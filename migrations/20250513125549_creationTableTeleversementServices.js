const nomTable = 'televersement_services';

exports.up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_utilisateur');
    table.primary(['id_utilisateur']);
    table.json('donnees');
  });

exports.down = (knex) => knex.schema.dropTable(nomTable);

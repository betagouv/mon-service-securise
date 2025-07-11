const nomTable = 'modeles_mesure_specifique';

exports.up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id');
    table.primary(['id']);
    table.uuid('id_utilisateur');
    table.json('donnees');
  });

exports.down = (knex) => knex.schema.dropTable(nomTable);

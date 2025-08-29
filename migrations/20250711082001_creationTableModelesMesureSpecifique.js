const nomTable = 'modeles_mesure_specifique';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id');
    table.primary(['id']);
    table.uuid('id_utilisateur');
    table.json('donnees');
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

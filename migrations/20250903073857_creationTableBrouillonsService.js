const nomTable = 'brouillons_service';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id');
    table.uuid('id_utilisateur');
    table.jsonb('donnees');
    table.primary(['id']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

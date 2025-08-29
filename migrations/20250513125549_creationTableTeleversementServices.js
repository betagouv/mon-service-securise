const nomTable = 'televersement_services';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_utilisateur');
    table.primary(['id_utilisateur']);
    table.json('donnees');
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

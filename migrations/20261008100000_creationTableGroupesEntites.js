const nomTable = 'groupes_entites';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id').primary();
    table.uuid('id_utilisateur').notNullable().index();
    table.jsonb('donnees').notNullable();
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

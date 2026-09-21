const nomTable = 'cles_api';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id').primary();

    table.uuid('id_utilisateur').notNullable().index();
    table.string('prefixe').notNullable();
    table.string('empreinte').notNullable().unique().index();
    table.datetime('date_creation').notNullable();
    table.datetime('date_revocation');
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

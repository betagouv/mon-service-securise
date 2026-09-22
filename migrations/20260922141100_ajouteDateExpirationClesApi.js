const nomTable = 'cles_api';

export const up = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.datetime('date_expiration').notNullable();
  });

export const down = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.dropColumn('date_expiration');
  });

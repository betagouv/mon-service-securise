const nomTable = 'notifications_transactionnelles';

export const up = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.datetime('date_expiration');
  });

export const down = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.dropColumn('date_expiration');
  });

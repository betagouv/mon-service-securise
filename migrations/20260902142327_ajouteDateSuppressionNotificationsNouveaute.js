const nomTable = 'notifications_nouveaute';

export const up = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.datetime('date_suppression');
  });

export const down = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.dropColumn('date_suppression');
  });

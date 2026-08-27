const nomTable = 'notifications_transactionnelles';

export const up = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.boolean('lue').defaultTo(false);
  });

export const down = (knex) =>
  knex.schema.alterTable(nomTable, (table) => {
    table.dropColumn('lue');
  });

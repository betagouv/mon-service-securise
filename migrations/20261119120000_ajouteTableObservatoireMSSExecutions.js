const nomTable = 'observatoire_mss_executions';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.timestamp('date_execution', { useTz: true }).notNullable();
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

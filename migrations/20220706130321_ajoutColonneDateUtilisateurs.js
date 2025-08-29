export const up = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.datetime('date_creation').defaultTo(knex.fn.now());
  });

export const down = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.dropColumn('date_creation');
  });

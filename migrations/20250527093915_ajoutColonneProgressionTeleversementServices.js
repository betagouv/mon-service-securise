export const up = (knex) =>
  knex.schema.alterTable('televersement_services', (table) => {
    table.integer('progression').defaultTo(0);
  });

export const down = (knex) =>
  knex.schema.alterTable('televersement_services', (table) => {
    table.dropColumn('progression');
  });

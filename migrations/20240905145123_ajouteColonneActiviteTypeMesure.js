export const up = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.string('type_mesure');
  });

export const down = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.dropColumn('type_mesure');
  });

export const up = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.string('id_mesure');
  });

export const down = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.dropColumn('id_mesure');
  });

export const up = (knex) =>
  knex.schema.createTable('activites_mesure', (table) => {
    table.uuid('id_acteur');
    table.uuid('id_service');
    table.string('type');
    table.datetime('date').defaultTo(knex.fn.now());
    table.json('details');
  });

export const down = (knex) => knex.schema.dropTable('activites_mesure');

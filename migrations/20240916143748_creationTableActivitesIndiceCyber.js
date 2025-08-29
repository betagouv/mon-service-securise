export const up = (knex) =>
  knex.schema.createTable('evolutions_indice_cyber', (table) => {
    table.uuid('id_service');
    table.json('indice_cyber');
    table.json('indice_cyber_personnalise');
    table.json('mesures_par_statut');
    table.datetime('date').defaultTo(knex.fn.now());
  });

export const down = (knex) => knex.schema.dropTable('evolutions_indice_cyber');

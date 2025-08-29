export const up = (knex) =>
  knex.schema.alterTable('taches_service', (table) => {
    table.json('donnees').defaultTo({});
  });

export const down = (knex) =>
  knex.schema.alterTable('taches_service', (table) => {
    table.dropColumn('donnees');
  });

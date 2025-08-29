export const up = (knex) =>
  knex.schema.createTable('services', (table) => {
    table.uuid('id');
    table.primary('id');
    table.json('donnees');
  });

export const down = (knex) => knex.schema.dropTable('services');

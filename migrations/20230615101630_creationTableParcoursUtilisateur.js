export const up = (knex) =>
  knex.schema.createTable('parcours_utilisateurs', (table) => {
    table.uuid('id');
    table.primary('id');
    table.jsonb('donnees');
  });

export const down = (knex) => knex.schema.dropTable('parcours_utilisateurs');

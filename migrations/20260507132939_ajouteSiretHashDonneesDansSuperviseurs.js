export const up = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.string('siret_hash');
    table.jsonb('donnees');
  });

export const down = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.dropColumn('siret_hash');
    table.dropColumn('donnees');
  });

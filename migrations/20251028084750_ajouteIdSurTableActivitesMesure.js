// Cette nouvelle colonne ID va permettre de faire des UPDATE faciles
// dans la migration suivante.
export const up = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
  });

export const down = (knex) =>
  knex.schema.alterTable('activites_mesure', (table) => table.dropColumn('id'));

export const up = (knex) =>
  knex.schema.alterTable('televersement_services', (table) => {
    table.string('version_service').defaultTo('v1').notNullable();
  });

export const down = (knex) =>
  knex.schema.alterTable('televersement_services', (table) =>
    table.dropColumn('version_service')
  );

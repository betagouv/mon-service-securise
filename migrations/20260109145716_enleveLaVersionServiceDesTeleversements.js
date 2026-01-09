const tableCible = 'televersement_services';

export const up = (knex) =>
  knex.schema.alterTable(tableCible, (t) => t.dropColumn('version_service'));

export const down = (knex) =>
  knex.schema.alterTable(tableCible, (t) =>
    t.string('version_service').defaultTo('v2').notNullable()
  );

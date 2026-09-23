const nomTable = 'api_publique_audit';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();

    table.uuid('id_cle_api').notNullable().index();
    table.uuid('id_utilisateur').notNullable().index();

    table.string('route').notNullable();
    table.jsonb('adresse_ip').notNullable();

    table.datetime('date').defaultTo(knex.fn.now());
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

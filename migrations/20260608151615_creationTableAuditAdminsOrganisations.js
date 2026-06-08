const nomTable = 'admins_organisations_audit';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();

    table.uuid('id_acteur').notNullable();
    table.string('email_acteur_hash').notNullable();

    table.string('type_action').notNullable();
    table.datetime('date_action').defaultTo(knex.fn.now());

    table.uuid('id_utilisateur_cible').notNullable();
    table.string('email_utilisateur_cible_hash').notNullable();

    table.string('siret_hash').notNullable();

    table.uuid('id_service_cible').nullable();

    table.jsonb('donnees').notNullable();
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

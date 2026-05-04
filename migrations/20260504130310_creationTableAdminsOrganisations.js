const nomTable = 'admins_organisations';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_utilisateur').notNullable();
    table.string('siret_hash').notNullable();
    table.jsonb('donnees').notNullable();
    table.primary(['id_utilisateur', 'siret_hash']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

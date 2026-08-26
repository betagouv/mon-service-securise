const nomTable = 'notifications_transactionnelles';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id').primary();

    table.uuid('id_acteur').nullable();
    table.uuid('id_destinataire').notNullable();
    table.string('type').notNullable();
    table.datetime('date').notNullable();
    table.jsonb('metadonnees').notNullable();
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

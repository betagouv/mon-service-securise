const nomTable = 'simulation_migration_referentiel';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_service');
    table.jsonb('donnees');
    table.primary(['id_service']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

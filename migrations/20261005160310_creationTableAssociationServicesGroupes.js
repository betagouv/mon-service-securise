const nomTable = 'groupes_services_association_aux_services';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_groupe').notNullable();
    table.uuid('id_service').notNullable();
    table.primary(['id_groupe', 'id_service']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

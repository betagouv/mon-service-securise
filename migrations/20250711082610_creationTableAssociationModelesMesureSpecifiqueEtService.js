const nomTable = 'modeles_mesure_specifique_association_aux_services';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_modele');
    table.uuid('id_service');
    table.primary(['id_modele', 'id_service']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

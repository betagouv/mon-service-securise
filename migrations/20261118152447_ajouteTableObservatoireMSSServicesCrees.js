const nomTable = 'observatoire_mss_services_crees';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.string('id_hash').primary();
    table.date('date_creation');
    table.string('niveau_securite');
    table.string('region');
    table.string('departement');
    table.string('secteur_activite');
    table.string('type_organisation');
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

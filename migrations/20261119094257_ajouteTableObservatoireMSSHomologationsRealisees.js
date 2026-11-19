const nomTable = 'observatoire_mss_homologations_realisees';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table
      .string('id_hash_service')
      .references('id_hash')
      .inTable('observatoire_mss_services_crees')
      .notNullable();
    table.integer('total_realisees');
    table.date('date');
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

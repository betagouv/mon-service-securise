const nomTable = 'observatoire_mss_mesures_faites';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table
      .string('id_hash_service')
      .references('id_hash')
      .inTable('observatoire_mss_services_crees')
      .notNullable();
    table.integer('total_faites');
    table.date('date');
    table.unique(['id_hash_service', 'date']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

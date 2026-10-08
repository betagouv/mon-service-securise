const nomTable = 'groupes_entites_association_aux_entites';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.uuid('id_groupe').notNullable();
    table.string('siret_hash').notNullable();
    table.primary(['id_groupe', 'siret_hash']);
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

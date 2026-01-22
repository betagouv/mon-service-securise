const nomTable = 'revocations_jwt';

export const up = (knex) =>
  knex.schema.createTable(nomTable, (table) => {
    table.string('hash_jwt_revoque', 64).notNullable().unique();
    table.dateTime('date_expiration').notNullable();
  });

export const down = (knex) => knex.schema.dropTable(nomTable);

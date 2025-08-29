const tableUtilisateurs = 'utilisateurs';

export const up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash', 64).notNullable().alter()
  );

export const down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash', 64).nullable().alter()
  );

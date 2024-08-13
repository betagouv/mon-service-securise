const tableUtilisateurs = 'utilisateurs';

exports.up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash', 64).notNullable().alter()
  );

exports.down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash', 64).nullable().alter()
  );

const tableUtilisateurs = 'utilisateurs';

exports.up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash')
  );

exports.down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.dropColumn('email_hash')
  );

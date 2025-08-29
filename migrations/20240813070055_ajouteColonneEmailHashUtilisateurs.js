const tableUtilisateurs = 'utilisateurs';

export const up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.string('email_hash')
  );

export const down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.dropColumn('email_hash')
  );

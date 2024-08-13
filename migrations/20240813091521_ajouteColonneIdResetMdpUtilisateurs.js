const tableUtilisateurs = 'utilisateurs';

exports.up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.uuid('id_reset_mdp')
  );

exports.down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.dropColumn('id_reset_mdp')
  );

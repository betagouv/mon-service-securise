const tableUtilisateurs = 'utilisateurs';

export const up = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.uuid('id_reset_mdp')
  );

export const down = (knex) =>
  knex.schema.alterTable(tableUtilisateurs, (table) =>
    table.dropColumn('id_reset_mdp')
  );

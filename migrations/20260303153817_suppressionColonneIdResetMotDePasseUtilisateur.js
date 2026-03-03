const tableCible = 'utilisateurs';

export const up = (knex) =>
  knex.schema.alterTable(tableCible, (t) => t.dropColumn('id_reset_mdp'));

export const down = (knex) =>
  knex.schema.alterTable(tableCible, (t) => t.uuid('id_reset_mdp').nullable());

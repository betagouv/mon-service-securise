export const up = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.text('email_hash').alter();
  });

export const down = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.string('email_hash', 64).alter();
  });

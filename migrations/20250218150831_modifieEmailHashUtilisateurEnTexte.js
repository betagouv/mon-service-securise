exports.up = (knex) =>
  knex.schema.alterTable('utilisateurs', (table) => {
    table.text('email_hash').alter();
  });

exports.down = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.string('email_hash', 64).alter();
  });

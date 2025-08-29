export const up = async (knex) =>
  knex.schema.createTable('notifications_nouveaute', (table) => {
    table.uuid('id_utilisateur');
    table.string('id_nouveaute');
    table.primary(['id_utilisateur', 'id_nouveaute']);
    table.datetime('date_lecture').defaultTo(knex.fn.now());
  });

export const down = async (knex) =>
  knex.schema.dropTable('notifications_nouveaute');

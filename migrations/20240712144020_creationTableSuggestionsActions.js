const tableSuggestionsActions = 'suggestions_actions';

exports.up = (knex) =>
  knex.schema.createTable(tableSuggestionsActions, (table) => {
    table.uuid('id_service');
    table.string('nature');
    table.primary(['id_service', 'nature']);
  });

exports.down = (knex) => knex.schema.dropTable(tableSuggestionsActions);

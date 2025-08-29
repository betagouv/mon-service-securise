const tableSuggestionsActions = 'suggestions_actions';

export const up = (knex) =>
  knex.schema.createTable(tableSuggestionsActions, (table) => {
    table.uuid('id_service');
    table.string('nature');
    table.primary(['id_service', 'nature']);
  });

export const down = (knex) => knex.schema.dropTable(tableSuggestionsActions);

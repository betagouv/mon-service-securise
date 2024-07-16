const tableSuggestions = 'suggestions_actions';

exports.up = (knex) =>
  knex.schema.alterTable(tableSuggestions, (table) =>
    table.datetime('date_acquittement')
  );

exports.down = (knex) =>
  knex.schema.alterTable(tableSuggestions, (table) =>
    table.dropColumn('date_acquittement')
  );

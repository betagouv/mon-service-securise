const tableSuggestions = 'suggestions_actions';

export const up = (knex) =>
  knex.schema.alterTable(tableSuggestions, (table) =>
    table.datetime('date_acquittement')
  );

export const down = (knex) =>
  knex.schema.alterTable(tableSuggestions, (table) =>
    table.dropColumn('date_acquittement')
  );

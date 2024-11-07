const services = 'services';
const nouvelleColonne = 'siret_hash';

exports.up = (knex) =>
  knex.schema.alterTable(services, (table) => table.string(nouvelleColonne));

exports.down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.dropColumn(nouvelleColonne)
  );

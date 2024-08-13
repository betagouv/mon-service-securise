const services = 'services';
const nouvelleColonne = 'nom_service_hash';

exports.up = (knex) =>
  knex.schema.alterTable(services, (table) => table.string(nouvelleColonne));

exports.down = (knex) =>
  knex.schema.alterTable(services, (table) =>
    table.dropColumn(nouvelleColonne)
  );

const nature = 'miseAJourNombreOrganisationsUtilisatrices';

exports.up = (knex) =>
  knex.raw(
    `
        INSERT INTO suggestions_actions (id_service, nature)
        SELECT id, '${nature}'
        FROM services
        WHERE donnees->'descriptionService'->'nombreOrganisationsUtilisatrices'->>'borneBasse' = '0';
    `
  );

exports.down = (knex) =>
  knex.raw(`DELETE FROM suggestions_actions WHERE nature = '${nature}';`);

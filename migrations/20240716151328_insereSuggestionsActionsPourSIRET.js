exports.up = (knex) =>
  knex.raw(
    `
        INSERT INTO suggestions_actions (id_service, nature)
        SELECT id, 'miseAJourSiret'
        from services
        where donnees->'descriptionService'->'organisationResponsable'->'siret' is null
           OR donnees->'descriptionService'->'organisationResponsable'->>'siret' = '';
    `
  );

exports.down = (knex) =>
  knex.raw(`DELETE FROM suggestions_actions WHERE nature = 'miseAJourSiret';`);

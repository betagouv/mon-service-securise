export const up = async (knex) => {
  await knex.raw(
    `CREATE INDEX autorisations_id_utilisateur_index
       ON autorisations (((donnees ->> 'idUtilisateur')::uuid))`
  );
  await knex.raw(
    `CREATE INDEX autorisations_id_service_index
       ON autorisations (((donnees ->> 'idService')::uuid))`
  );
  await knex.schema.alterTable('modeles_mesure_specifique', (table) => {
    table.index('id_utilisateur');
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable('modeles_mesure_specifique', (table) => {
    table.dropIndex('id_utilisateur');
  });
  await knex.raw('DROP INDEX autorisations_id_service_index');
  await knex.raw('DROP INDEX autorisations_id_utilisateur_index');
};

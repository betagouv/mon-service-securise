exports.up = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) => {
    donnees.entite = { ...donnees.entite, siret: '' };
    return knex('utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) => {
    const { siret, ...entiteSansSiret } = donnees.entite;
    donnees.entite = entiteSansSiret;
    return knex('utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

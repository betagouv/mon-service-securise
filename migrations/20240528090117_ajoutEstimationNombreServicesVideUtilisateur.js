exports.up = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) => {
    donnees.estimationNombreServices = { borneBasse: '0', borneHaute: '0' };
    return knex('utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) => {
    delete donnees.estimationNombreServices;
    return knex('utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

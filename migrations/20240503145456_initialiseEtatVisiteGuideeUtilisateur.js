export const up = async (knex) => {
  const parcoursUtilisateurs = await knex('parcours_utilisateurs');
  const misesAJour = parcoursUtilisateurs.map(({ id, donnees }) => {
    donnees.etatVisiteGuidee = { dejaTerminee: true, enPause: false };
    return knex('parcours_utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

export const down = async (knex) => {
  const parcoursUtilisateurs = await knex('parcours_utilisateurs');
  const misesAJour = parcoursUtilisateurs.map(({ id, donnees }) => {
    delete donnees.etatVisiteGuidee;
    return knex('parcours_utilisateurs').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

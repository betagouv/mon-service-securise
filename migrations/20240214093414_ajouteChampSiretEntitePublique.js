exports.up = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) =>
    knex('utilisateurs')
      .where({ id })
      .update({ donnees: { ...donnees, siretEntitePublique: null } })
  );
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(
    ({ id, donnees: { siretEntitePublique, ...autresDonnees } }) =>
      knex('utilisateurs').where({ id }).update({ donnees: autresDonnees })
  );

  await Promise.all(misesAJour);
};

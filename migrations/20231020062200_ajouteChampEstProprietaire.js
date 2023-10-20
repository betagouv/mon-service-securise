exports.up = async (knex) => {
  const autorisations = await knex('autorisations');
  const misesAJour = autorisations.map(({ id, donnees }) => {
    const estProprietaire = donnees.type === 'createur';
    return knex('autorisations')
      .where({ id })
      .update({ donnees: { ...donnees, estProprietaire } });
  });
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const autorisations = await knex('autorisations');
  const misesAJour = autorisations.map(
    ({ id, donnees: { estProprietaire, ...autresDonnees } }) =>
      knex('autorisations').where({ id }).update({ donnees: autresDonnees })
  );

  await Promise.all(misesAJour);
};

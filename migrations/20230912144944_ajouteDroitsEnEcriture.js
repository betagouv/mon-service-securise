exports.up = async (knex) => {
  const autorisations = await knex('autorisations');

  const misesAJour = autorisations.map(({ id, donnees }) =>
    knex('autorisations')
      .where({ id })
      .update({
        donnees: {
          ...donnees,
          droits: {
            DECRIRE: 2,
            SECURISER: 2,
            HOMOLOGUER: 2,
            RISQUES: 2,
            CONTACTS: 2,
          },
        },
      })
  );

  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const autorisations = await knex('autorisations');

  const misesAJour = autorisations.map(
    ({ id, donnees: { droits, ...autreDonnees } }) =>
      knex('autorisations').where({ id }).update({
        donnees: autreDonnees,
      })
  );

  await Promise.all(misesAJour);
};

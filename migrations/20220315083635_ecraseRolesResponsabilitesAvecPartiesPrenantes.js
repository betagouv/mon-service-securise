exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.partiesPrenantes)
      .map(({ id, donnees: { partiesPrenantes, rolesResponsabilites, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: {
          partiesPrenantes, rolesResponsabilites: partiesPrenantes, ...autresDonnees,
        } }));
    return Promise.all(misesAJour);
  });

exports.down = () => {};

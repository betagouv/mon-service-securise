exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.partiesPrenantes)
      .map(({ id, donnees: { partiesPrenantes: _, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: { ...autresDonnees } }));
    return Promise.all(misesAJour);
  });

exports.down = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.rolesResponsabilites)
      .map(({ id, donnees: { rolesResponsabilites, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: {
          rolesResponsabilites, partiesPrenantes: rolesResponsabilites, ...autresDonnees,
        } }));
    return Promise.all(misesAJour);
  });

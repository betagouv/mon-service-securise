exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const suppressions = lignes.map(
      ({ id, donnees: { idUtilisateur: _, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({ donnees: { ...autresDonnees } })
    );

    return Promise.all(suppressions);
  });

exports.down = (knex) =>
  knex('autorisations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees: { type } }) => type === 'createur')
      .map(({ donnees: { idHomologation, idUtilisateur } }) =>
        knex('homologations')
          .where({ id: idHomologation })
          .first()
          .then(({ donnees }) =>
            knex('homologations')
              .where({ id: idHomologation })
              .update({ donnees: Object.assign(donnees, { idUtilisateur }) })
          )
      );

    return Promise.all(misesAJour);
  });

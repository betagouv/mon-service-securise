exports.up = (knex) =>
  knex('autorisations').then((lignes) => {
    const suppressions = lignes.map(
      ({ id, donnees: { idHomologation: _, ...autresDonnees } }) =>
        knex('autorisations').where({ id }).update({ donnees: autresDonnees })
    );
    return Promise.all(suppressions);
  });

exports.down = (knex) =>
  knex('autorisations').then((lignes) => {
    const ajouts = lignes.map(
      ({ id, donnees: { idService, ...autresDonnees } }) =>
        knex('autorisations')
          .where({ id })
          .update({
            donnees: { ...autresDonnees, idService, idHomologation: idService },
          })
    );
    return Promise.all(ajouts);
  });

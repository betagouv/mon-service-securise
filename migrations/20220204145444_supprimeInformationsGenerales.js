exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.informationsGenerales)
      .map(({ id, donnees: { informationsGenerales: _, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({ donnees: { ...autresDonnees } })
      );
    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.descriptionService)
      .map(({ id, donnees: { descriptionService, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({
            donnees: {
              descriptionService,
              informationsGenerales: descriptionService,
              ...autresDonnees,
            },
          })
      );
    return Promise.all(misesAJour);
  });

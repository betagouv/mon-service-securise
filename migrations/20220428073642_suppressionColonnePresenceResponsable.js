exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees?.descriptionService)
      .map(({ id, donnees: { descriptionService, ...autresDonnees } }) => {
        delete descriptionService.presenceResponsable;
        return knex('homologations')
          .where({ id })
          .update({ donnees: { descriptionService, ...autresDonnees } });
      });
    return Promise.all(misesAJour);
  });

exports.down = () => {};

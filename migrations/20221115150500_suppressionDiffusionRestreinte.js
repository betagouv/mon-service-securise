// Il s'agit de supprimer la valeur 'diffusionRestreinte' dans les
// 'donneesCaracterePersonnel' de la description des services.
// Car 'Diffusion restreinte' est supprimée du référentiel.

exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.descriptionService)
      .map(({ id, donnees }) => {
        donnees.descriptionService.donneesCaracterePersonnel = donnees
          .descriptionService
          .donneesCaracterePersonnel
          .filter((d) => d !== 'diffusionRestreinte');

        return knex('homologations').where({ id }).update({ donnees });
      });

    return Promise.all(misesAJour);
  });

exports.down = () => Promise.resolve();

// Il s'agit de supprimer la valeur 'diffusionRestreinte' dans les
// 'donneesCaracterePersonnel' de la description des services.
// Car 'Diffusion restreinte' est supprimée du référentiel.

const supprimeDiffusionRestreinteDansTable = (knex, table) =>
  knex(table).then((lignes) => {
    const misesAJour = lignes
      .filter(
        ({ donnees }) => donnees.descriptionService?.donneesCaracterePersonnel
      )
      .map(({ id, donnees }) => {
        donnees.descriptionService.donneesCaracterePersonnel =
          donnees.descriptionService.donneesCaracterePersonnel.filter(
            (d) => d !== 'diffusionRestreinte'
          );

        return knex(table).where({ id }).update({ donnees });
      });

    return Promise.all(misesAJour);
  });

exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeDiffusionRestreinteDansTable(knex, table)
    )
  );

exports.down = () => Promise.resolve();

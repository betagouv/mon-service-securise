const DescriptionService = require('../src/modeles/descriptionService');

exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      knex(table).then((lignes) => {
        const misesAJour = lignes.map(({ id, donnees }) => {
          const niveauSecurite = DescriptionService.estimeNiveauDeSecurite(
            donnees.descriptionService
          );
          const donneesModifiees = {
            ...donnees,
            descriptionService: {
              ...donnees.descriptionService,
              niveauSecurite,
            },
          };
          return knex(table).where({ id }).update({
            donnees: donneesModifiees,
          });
        });
        return Promise.all(misesAJour);
      })
    )
  );

exports.down = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      knex(table).then((lignes) => {
        const misesAJour = lignes.map(({ id, donnees }) => {
          delete donnees.descriptionService.niveauSecurite;
          return knex(table).where({ id }).update({
            donnees,
          });
        });
        return Promise.all(misesAJour);
      })
    )
  );

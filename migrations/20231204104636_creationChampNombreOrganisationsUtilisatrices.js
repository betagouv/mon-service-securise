import pourChaqueLigne from './utilitaires/pourChaqueLigne.js';

const ajouteChamp = async (knex, table) =>
  pourChaqueLigne(knex(table), async ({ id, donnees }) => {
    donnees.descriptionService.nombreOrganisationsUtilisatrices = {
      borneBasse: '0',
      borneHaute: '0',
    };

    await knex(table).where({ id }).update({ donnees });
  });

export const up = async (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) => ajouteChamp(knex, table))
  );

const supprimeChamp = async (knex, table) =>
  pourChaqueLigne(knex(table), async ({ id, donnees }) => {
    delete donnees.descriptionService.nombreOrganisationsUtilisatrices;

    await knex(table).where({ id }).update({ donnees });
  });

export const down = async (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) => supprimeChamp(knex, table))
  );

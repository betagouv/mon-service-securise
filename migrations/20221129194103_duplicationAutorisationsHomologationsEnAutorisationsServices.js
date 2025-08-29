import pourChaqueLigne from './utilitaires/pourChaqueLigne.js';

export const up = (knex) =>
  pourChaqueLigne(knex('autorisations'), ({ id, donnees }) => {
    donnees.idService = donnees.idHomologation;
    return knex('autorisations').where({ id }).update({ donnees });
  });

export const down = (knex) =>
  pourChaqueLigne(
    knex('autorisations'),
    ({ id, donnees: { idService, ...autresDonnees } }) =>
      knex('autorisations').where({ id }).update({ donnees: autresDonnees })
  );

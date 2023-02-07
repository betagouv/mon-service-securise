const pourChaqueLigne = require('./utilitaires/pourChaqueLigne');

exports.up = (knex) => pourChaqueLigne(
  knex('autorisations'),
  ({ id, donnees }) => {
    donnees.idService = donnees.idHomologation;
    return knex('autorisations').where({ id }).update({ donnees });
  },
);

exports.down = (knex) => pourChaqueLigne(
  knex('autorisations'),
  ({ id, donnees: { idService, ...autresDonnees } }) => knex('autorisations')
    .where({ id })
    .update({ donnees: autresDonnees }),
);

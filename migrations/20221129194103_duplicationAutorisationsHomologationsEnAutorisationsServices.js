const pourChaqueLigne = (requete, miseAJour) => import('p-map')
  .then((module) => {
    const pMap = module.default;

    return requete.then((lignes) => pMap(lignes, miseAJour, { concurrency: 2 }));
  });

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

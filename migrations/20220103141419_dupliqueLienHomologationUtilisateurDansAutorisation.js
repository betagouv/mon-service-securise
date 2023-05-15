const uuid = require('uuid');

const ajouteAutorisationCreateurSiInexistante = (
  knex,
  idUtilisateur,
  idHomologation
) =>
  knex('autorisations').then((lignes) => {
    const autorisationsExistantes = lignes.filter(
      ({ donnees }) =>
        donnees.idHomologation === idHomologation &&
        donnees.idUtilisateur === idUtilisateur &&
        donnees.type === 'createur'
    );
    if (autorisationsExistantes.length > 0) return Promise.resolve();

    return knex('autorisations').insert({
      id: uuid.v4(),
      donnees: { idHomologation, idUtilisateur, type: 'createur' },
    });
  });

exports.up = (knex) =>
  knex('homologations').then((lignes) =>
    Promise.all(
      lignes.map(({ id, donnees: { idUtilisateur } }) =>
        ajouteAutorisationCreateurSiInexistante(knex, idUtilisateur, id)
      )
    )
  );

exports.down = (knex) => knex('autorisations').del();

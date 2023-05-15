const pourChaqueLigne = require('./utilitaires/pourChaqueLigne');

const supprimeIdUtilisateur = (knex, table) =>
  pourChaqueLigne(
    knex(table).whereRaw("donnees->>'idUtilisateur' IS NOT NULL"),
    ({ id, donnees: { idUtilisateur, ...autresDonnees } }) =>
      knex(table).where({ id }).update({ donnees: autresDonnees })
  );

exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeIdUtilisateur(knex, table)
    )
  );

exports.down = () => Promise.resolve();

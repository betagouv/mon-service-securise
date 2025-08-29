import pourChaqueLigne from './utilitaires/pourChaqueLigne.js';

const supprimeIdUtilisateur = (knex, table) =>
  pourChaqueLigne(
    knex(table).whereRaw("donnees->>'idUtilisateur' IS NOT NULL"),
    ({ id, donnees: { idUtilisateur, ...autresDonnees } }) =>
      knex(table).where({ id }).update({ donnees: autresDonnees })
  );

export const up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeIdUtilisateur(knex, table)
    )
  );

export const down = () => Promise.resolve();

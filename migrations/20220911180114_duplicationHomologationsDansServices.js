export const up = (knex) =>
  knex('homologations')
    .then((lignes) => lignes.map((donnees) => knex('services').insert(donnees)))
    .then((insertions) => Promise.all(insertions));

export const down = (knex) => knex('services').del();

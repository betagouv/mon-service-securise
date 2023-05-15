exports.up = (knex) =>
  knex('utilisateurs').then((lignes) =>
    Promise.all(
      lignes.map(({ id, donnees }) => {
        donnees.email = donnees.email.toLowerCase();
        return knex('utilisateurs').where({ id }).update({ donnees });
      })
    )
  );

exports.down = () => {};

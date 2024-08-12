exports.up = (knex) =>
  knex('services').then((lignes) => {
    const suppressions = lignes.map(
      ({ id, donnees: { id: _, ...autresDonnees } }) =>
        knex('services').where({ id }).update({ donnees: autresDonnees })
    );
    return Promise.all(suppressions);
  });

exports.down = () => {};

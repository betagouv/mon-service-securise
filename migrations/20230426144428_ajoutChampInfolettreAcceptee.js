exports.up = (knex) => knex('utilisateurs')
  .then((lignes) => {
    const misesAJour = lignes
      .map(({ id, donnees }) => knex('utilisateurs')
        .where({ id })
        .update({ donnees: { ...donnees, infolettreAcceptee: false } }));

    return Promise.all(misesAJour);
  });

exports.down = (knex) => knex('utilisateurs')
  .then((lignes) => {
    const misesAJour = lignes
      .map(({ id, donnees: { infolettreAcceptee: _, ...autresDonnees } }) => knex('utilisateurs')
        .where({ id })
        .update({ donnees: { ...autresDonnees } }));

    return Promise.all(misesAJour);
  });

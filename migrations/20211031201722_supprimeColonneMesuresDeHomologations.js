exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes.map(
      ({ id, donnees: { mesures: _, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({ donnees: { ...autresDonnees } })
    );

    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.mesuresGenerales)
      .map(({ id, donnees: { mesuresGenerales, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({
            donnees: {
              mesures: mesuresGenerales,
              mesuresGenerales,
              ...autresDonnees,
            },
          })
      );

    return Promise.all(misesAJour);
  });

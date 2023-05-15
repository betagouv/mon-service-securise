exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.mesures)
      .map(({ id, donnees: { mesures, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({
            donnees: { mesures, mesuresGenerales: mesures, ...autresDonnees },
          })
      );

    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.mesuresGenerales)
      .map(
        ({ id, donnees: { mesures: _, mesuresGenerales, ...autresDonnees } }) =>
          knex('homologations')
            .where({ id })
            .update({
              donnees: { mesures: mesuresGenerales, ...autresDonnees },
            })
      );

    return Promise.all(misesAJour);
  });

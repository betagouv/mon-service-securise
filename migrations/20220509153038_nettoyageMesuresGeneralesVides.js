exports.up = (knex) =>
  knex('homologations').then((lines) => {
    const misesAJour = lines
      .filter(({ donnees }) => donnees?.mesuresGenerales)
      .map(({ id, donnees: { mesuresGenerales, ...autresDonnees } }) => {
        const mesuresNettoyees = mesuresGenerales.filter(
          (mesure) => mesure.statut || mesure.modalites
        );
        return knex('homologations')
          .where({ id })
          .update({
            donnees: { mesuresGenerales: mesuresNettoyees, ...autresDonnees },
          });
      });
    return Promise.all(misesAJour);
  });

exports.down = () => {};

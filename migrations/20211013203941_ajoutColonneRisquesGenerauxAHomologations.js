exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.risques)
      .map(({ id, donnees: { risques, ...autresDonnees } }) =>
        knex('homologations')
          .where({ id })
          .update({
            donnees: { risques, risquesGeneraux: risques, ...autresDonnees },
          })
      );

    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.risquesGeneraux)
      .map(
        ({ id, donnees: { risques: _, risquesGeneraux, ...autresDonnees } }) =>
          knex('homologations')
            .where({ id })
            .update({ donnees: { risques: risquesGeneraux, ...autresDonnees } })
      );

    return Promise.all(misesAJour);
  });

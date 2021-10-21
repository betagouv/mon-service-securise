exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .map(({ id, donnees: { risques, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: { ...autresDonnees } }));

    return Promise.all(misesAJour);
  });

exports.down = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.risquesGeneraux)
      .map(({ id, donnees: { risquesGeneraux, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: { risques: risquesGeneraux, risquesGeneraux, ...autresDonnees } }));

    return Promise.all(misesAJour);
  });

exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.caracteristiquesComplementaires)
      .map(({ id, donnees: { caracteristiquesComplementaires: _, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: { ...autresDonnees } }));
    return Promise.all(misesAJour);
  });

exports.down = () => {};

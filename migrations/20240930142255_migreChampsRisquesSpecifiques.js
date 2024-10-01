exports.up = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id: idService, donnees }) => {
      const donneesModifiees = {
        ...donnees,
        risquesSpecifiques: donnees.risquesSpecifiques?.map(
          ({ id, niveauGravite, description, commentaire }) => ({
            id,
            niveauGravite,
            intitule: description,
            description: '',
            commentaire,
          })
        ),
      };
      return knex('services').where({ id: idService }).update({
        donnees: donneesModifiees,
      });
    });
    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id: idService, donnees }) => {
      const donneesModifiees = {
        ...donnees,
        risquesSpecifiques: donnees.risquesSpecifiques?.map(
          ({ id, intitule, niveauGravite, commentaire }) => ({
            id,
            niveauGravite,
            description: intitule,
            commentaire,
          })
        ),
      };
      return knex('services').where({ id: idService }).update({
        donnees: donneesModifiees,
      });
    });
    return Promise.all(misesAJour);
  });

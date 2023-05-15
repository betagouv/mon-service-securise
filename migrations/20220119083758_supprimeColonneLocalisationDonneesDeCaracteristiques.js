exports.up = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.caracteristiquesComplementaires)
      .map(
        ({
          id,
          donnees: { caracteristiquesComplementaires, ...autresDonnees },
        }) => {
          delete caracteristiquesComplementaires.localisationDonnees;
          return knex('homologations')
            .where({ id })
            .update({
              donnees: { caracteristiquesComplementaires, ...autresDonnees },
            });
        }
      );
    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.descriptionService)
      .map(({ id, donnees }) => {
        donnees.caracteristiquesComplementaires ||= {};
        donnees.caracteristiquesComplementaires.localisationDonnees =
          donnees.descriptionService.localisationDonnees;
        return knex('homologations').where({ id }).update({ donnees });
      });
    return Promise.all(misesAJour);
  });

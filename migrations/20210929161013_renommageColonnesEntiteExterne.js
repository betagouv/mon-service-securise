const renommeColonnesEntitesExternes = (knex, lignes, renommage) => {
  const misesAJour = lignes
    .filter(({ donnees }) => donnees.caracteristiquesComplementaires?.entitesExternes)
    .map(({ id, donnees }) => {
      donnees.caracteristiquesComplementaires.entitesExternes = donnees
        .caracteristiquesComplementaires.entitesExternes.map(renommage);

      return knex('homologations').where({ id }).update({ donnees });
    });

  return Promise.all(misesAJour);
};

exports.up = (knex) => knex('homologations')
  .then((lignes) => renommeColonnesEntitesExternes(
    knex,
    lignes,
    ({ nom, role }) => ({ nom, acces: role }),
  ));

exports.down = (knex) => knex('homologations')
  .then((lignes) => renommeColonnesEntitesExternes(
    knex,
    lignes,
    ({ nom, acces }) => ({ nom, role: acces }),
  ));

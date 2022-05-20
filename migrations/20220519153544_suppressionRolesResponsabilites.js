exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.rolesResponsabilites)
      .map(({ id, donnees: { rolesResponsabilites: _, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: { ...autresDonnees } }));
    return Promise.all(misesAJour);
  });

exports.down = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.cartographieActeurs)
      .map(({ id, donnees: { cartographieActeurs, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: {
          cartographieActeurs, rolesResponsabilites: cartographieActeurs, ...autresDonnees,
        } }));
    return Promise.all(misesAJour);
  });

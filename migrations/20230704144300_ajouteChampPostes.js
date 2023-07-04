exports.up = (knex) =>
  knex('utilisateurs').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      const postes = [
        ...(donnees.rssi ? ['RSSI'] : []),
        ...(donnees.delegueProtectionDonnees ? ['DPO'] : []),
        ...(donnees.poste ? [donnees.poste] : []),
      ];
      return knex('utilisateurs')
        .where({ id })
        .update({ donnees: { ...donnees, postes } });
    });

    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('utilisateurs').then((lignes) => {
    const misesAJour = lignes.map(
      ({ id, donnees: { postes, ...autresDonnees } }) =>
        knex('utilisateurs').where({ id }).update({ donnees: autresDonnees })
    );

    return Promise.all(misesAJour);
  });

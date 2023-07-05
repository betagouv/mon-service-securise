exports.up = (knex) =>
  knex('utilisateurs').then((lignes) => {
    const misesAJour = lignes.map(
      ({
        id,
        donnees: { poste, rssi, delegueProtectionDonnees, ...autresDonnees },
      }) =>
        knex('utilisateurs').where({ id }).update({ donnees: autresDonnees })
    );

    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('utilisateurs').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      const { postes } = donnees;
      const rssi = postes.includes('RSSI');
      const delegueProtectionDonnees = postes.includes('DPO');
      const poste = postes.filter((p) => p !== 'RSSI' && p !== 'DPO').join(' ');
      return knex('utilisateurs')
        .where({ id })
        .update({
          donnees: { ...donnees, rssi, delegueProtectionDonnees, poste },
        });
    });

    return Promise.all(misesAJour);
  });

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(({ id, donnees }) => {
      const { idResetMotDePasse, ...autreDonnees } = donnees;

      return trx('utilisateurs')
        .where({ id })
        .update({
          id_reset_mdp: idResetMotDePasse || null,
          donnees: autreDonnees,
        });
    });

    await Promise.all(maj);
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(
      ({ id, donnees, id_reset_mdp: idResetMotDePasse }) => {
        const nouvellesDonnees = {
          ...donnees,
        };
        if (idResetMotDePasse)
          nouvellesDonnees.idResetMotDePasse = idResetMotDePasse;

        return trx('utilisateurs').where({ id }).update({
          id_reset_mdp: null,
          donnees: nouvellesDonnees,
        });
      }
    );

    await Promise.all(maj);
  });
};

export const up = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(({ id, donnees }) => {
      const {
        id: _,
        dateCreation,
        idResetMotDePasse,
        ...autresDonnees
      } = donnees;
      return trx('utilisateurs')
        .where({ id })
        .update({ donnees: autresDonnees });
    });

    await Promise.all(maj);
  });
};

export const down = async () => {};

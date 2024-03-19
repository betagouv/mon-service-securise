exports.up = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(({ id, donnees }) => {
    const entite = {
      nom: donnees.nomEntitePublique,
      departement: donnees.departementEntitePublique,
    };
    const { departementEntitePublique, nomEntitePublique, ...autresDonnees } =
      donnees;
    return knex('utilisateurs')
      .where({ id })
      .update({ donnees: { ...autresDonnees, entite } });
  });
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const utilisateurs = await knex('utilisateurs');
  const misesAJour = utilisateurs.map(
    ({ id, donnees: { entite, ...autresDonnees } }) =>
      knex('utilisateurs')
        .where({ id })
        .update({
          donnees: {
            ...autresDonnees,
            departementEntitePublique: entite.departement,
            nomEntitePublique: entite.nom,
          },
        })
  );

  await Promise.all(misesAJour);
};

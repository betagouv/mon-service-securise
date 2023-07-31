const supprimeAvisExpertCyber = async (knex, table) => {
  const lignes = await knex(table);
  return Promise.all(
    lignes.map(({ id, donnees: { avisExpertCyber: _, ...autresDonnees } }) =>
      knex(table).where({ id }).update({ donnees: autresDonnees })
    )
  );
};

exports.up = async (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeAvisExpertCyber(knex, table)
    )
  );

exports.down = async () => {};

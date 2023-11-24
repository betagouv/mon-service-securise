// Le champ `type` des `Autorisation` n'est plus nécessaire, car il est remplacé par
// `estProprietaire`.

exports.up = async (knex) => {
  const autorisations = await knex('autorisations');
  const misesAJour = autorisations.map(({ id, donnees }) => {
    const { type, ...autresDonnees } = donnees;
    return knex('autorisations')
      .where({ id })
      .update({ donnees: autresDonnees });
  });
  await Promise.all(misesAJour);
};

// Impossible de remettre le champ, car la notion de `type = 'createur'` n'est pas faite
// pour supporter plusieurs créateurs. Alors que `estProprietaire: true` peut être
// présent sur plusieurs autorisations d'un même service.
exports.down = async () => {};

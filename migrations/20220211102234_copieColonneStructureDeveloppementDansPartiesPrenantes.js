const miseAJour = (contientDonneesCiblees, actionMiseAJour) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(contientDonneesCiblees)
      .map(({ id, donnees }) => {
        const donneesModifiees = actionMiseAJour(donnees);
        return knex('homologations')
          .where({ id })
          .update({ donnees: donneesModifiees });
      });
    return Promise.all(misesAJour);
  });

const contientStructureDeveloppement = ({ donnees }) => (
  donnees?.caracteristiquesComplementaires?.structureDeveloppement
);

const copieDansPartiesPrenantes = (donnees) => {
  donnees.partiesPrenantes ||= {};
  donnees.partiesPrenantes.partiesPrenantes ||= [];
  donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
    .filter((partiePrenante) => partiePrenante.type !== 'DeveloppementFourniture');
  donnees.partiesPrenantes.partiesPrenantes.push({
    type: 'DeveloppementFourniture',
    nom: donnees.caracteristiquesComplementaires.structureDeveloppement,
  });

  return donnees;
};

const contientPartiesPrenantes = ({ donnees }) => donnees.partiesPrenantes;

const supprimeDansPartiesPrenantes = (donnees) => {
  if (donnees.partiesPrenantes.partiesPrenantes) {
    donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
      .filter((partiePrenante) => partiePrenante.type !== 'DeveloppementFourniture');
  }

  return donnees;
};

exports.up = miseAJour(contientStructureDeveloppement, copieDansPartiesPrenantes);

exports.down = miseAJour(contientPartiesPrenantes, supprimeDansPartiesPrenantes);

const miseAJour = (contientDonneesCiblees, actionMiseAJour) => (knex) =>
  knex('homologations').then((lignes) => {
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

const contientCaracteristiquesComplementaires = ({ donnees }) =>
  donnees?.caracteristiquesComplementaires;

const supprimeStructureDeveloppement = (donnees) => {
  delete donnees.caracteristiquesComplementaires.structureDeveloppement;

  return donnees;
};

const contientPartiesPrenantes = ({ donnees }) => donnees?.partiesPrenantes;

const copieNomDeveloppementFourniture = (donnees) => {
  donnees.caracteristiquesComplementaires ||= {};
  donnees.caracteristiquesComplementaires.structureDeveloppement =
    donnees.partiesPrenantes?.partiesPrenantes?.find(
      (partiePrenante) => partiePrenante.type === 'DeveloppementFourniture'
    )?.nom;

  return donnees;
};

exports.up = miseAJour(
  contientCaracteristiquesComplementaires,
  supprimeStructureDeveloppement
);

exports.down = miseAJour(
  contientPartiesPrenantes,
  copieNomDeveloppementFourniture
);

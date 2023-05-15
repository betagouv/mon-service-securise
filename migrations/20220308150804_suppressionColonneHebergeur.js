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

const supprimeHebergeur = (donnees) => {
  delete donnees.caracteristiquesComplementaires.hebergeur;

  return donnees;
};

const contientPartiesPrenantes = ({ donnees }) => donnees?.partiesPrenantes;

const copieNomHebergement = (donnees) => {
  donnees.caracteristiquesComplementaires ||= {};
  donnees.caracteristiquesComplementaires.hebergeur =
    donnees.partiesPrenantes?.partiesPrenantes?.find(
      (partiePrenante) => partiePrenante.type === 'Hebergement'
    )?.nom;

  return donnees;
};

exports.up = miseAJour(
  contientCaracteristiquesComplementaires,
  supprimeHebergeur
);

exports.down = miseAJour(contientPartiesPrenantes, copieNomHebergement);

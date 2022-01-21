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

const contientHebergeur = ({ donnees }) => (
  donnees?.caracteristiquesComplementaires?.hebergeur
);

const copieDansPartiesPrenantes = (donnees) => {
  donnees.partiesPrenantes ||= {};
  donnees.partiesPrenantes.partiesPrenantes ||= [];
  donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
    .filter((partiePrenante) => partiePrenante.type !== 'Hebergement');
  donnees.partiesPrenantes.partiesPrenantes.push({
    type: 'Hebergement',
    nom: donnees.caracteristiquesComplementaires.hebergeur,
  });

  return donnees;
};

const contientPartiesPrenantes = ({ donnees }) => donnees.partiesPrenantes;

const supprimeDansPartiesPrenantes = (donnees) => {
  if (donnees.partiesPrenantes.partiesPrenantes) {
    donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
      .filter((partiePrenante) => partiePrenante.type !== 'Hebergement');
  }

  return donnees;
};

exports.up = miseAJour(contientHebergeur, copieDansPartiesPrenantes);

exports.down = miseAJour(contientPartiesPrenantes, supprimeDansPartiesPrenantes);

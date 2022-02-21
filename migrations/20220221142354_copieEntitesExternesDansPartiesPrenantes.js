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

const contientEntitesExternes = ({ donnees }) => (
  donnees?.caracteristiquesComplementaires?.entitesExternes
);

const copieDansPartiesPrenantes = (donnees) => {
  donnees.partiesPrenantes ||= {};
  donnees.partiesPrenantes.partiesPrenantes ||= [];
  donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
    .filter((partiePrenante) => partiePrenante.type !== 'PartiePrenanteSpecifique');

  donnees.caracteristiquesComplementaires.entitesExternes.map((entiteExterne) => ({
    type: 'PartiePrenanteSpecifique',
    nom: entiteExterne.nom,
    natureAcces: entiteExterne.acces,
    pointContact: entiteExterne.contact,
  })).forEach((partiePrenante) => donnees.partiesPrenantes.partiesPrenantes.push(partiePrenante));

  return donnees;
};

const contientPartiesPrenantes = ({ donnees }) => donnees?.partiesPrenantes?.partiesPrenantes;

const supprimeDansPartiesPrenantes = (donnees) => {
  donnees.partiesPrenantes.partiesPrenantes = donnees.partiesPrenantes.partiesPrenantes
    .filter((partiePrenante) => partiePrenante.type !== 'PartiePrenanteSpecifique');

  return donnees;
};

exports.up = miseAJour(contientEntitesExternes, copieDansPartiesPrenantes);

exports.down = miseAJour(contientPartiesPrenantes, supprimeDansPartiesPrenantes);

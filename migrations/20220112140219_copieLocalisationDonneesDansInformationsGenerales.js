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
  donnees.caracteristiquesComplementaires;

const copieDansInformationsGenerales = (donnees) => {
  donnees.informationsGenerales.localisationDonnees =
    donnees.caracteristiquesComplementaires.localisationDonnees;
  return donnees;
};

const contientInformationsGenerales = ({ donnees }) =>
  donnees.informationsGenerales;

const supprimeDansInformationsGenerales = (donnees) => {
  delete donnees.informationsGenerales.localisationDonnees;
  return donnees;
};

exports.up = miseAJour(
  contientCaracteristiquesComplementaires,
  copieDansInformationsGenerales
);

exports.down = miseAJour(
  contientInformationsGenerales,
  supprimeDansInformationsGenerales
);

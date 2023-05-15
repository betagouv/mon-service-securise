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
  donnees.informationsGenerales.presentation =
    donnees.caracteristiquesComplementaires.presentation;
  return donnees;
};

const contientInformationsGenerales = ({ donnees }) =>
  donnees.informationsGenerales;

const supprimeDansInformationsGenerales = (donnees) => {
  delete donnees.informationsGenerales.presentation;
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

const metsAJourDonnees = (modificationDonnees) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.informationsGenerales)
      .map(({ id, donnees }) => {
        const donneesModifiees = modificationDonnees(donnees);
        return knex('homologations').where({ id }).update({ donnees: donneesModifiees });
      });

    return Promise.all(misesAJour);
  });

const transformeEnStatut = (dejaMisEnLigne) => {
  switch (dejaMisEnLigne) {
    case 'oui':
      return 'accessible';
    case 'non':
      return 'nonAccessible';
    default:
      return undefined;
  }
};

const migreVersStatus = (donnees) => {
  donnees.informationsGenerales.statutDeploiement = transformeEnStatut(
    donnees.informationsGenerales.dejaMisEnLigne
  );
  delete donnees.informationsGenerales.dejaMisEnLigne;

  return donnees;
};

const transformeEnDejaMisEnLigne = (statutDeploiement) => {
  switch (statutDeploiement) {
    case 'accessible':
      return 'oui';
    case 'nonAccessible':
      return 'non';
    default:
      return undefined;
  }
};

const migreVersDejaMisEnLigne = (donnees) => {
  donnees.informationsGenerales.dejaMisEnLigne = transformeEnDejaMisEnLigne(
    donnees.informationsGenerales.statutDeploiement
  );
  delete donnees.informationsGenerales.statutDeploiement;

  return donnees;
};

exports.up = metsAJourDonnees(migreVersStatus);

exports.down = metsAJourDonnees(migreVersDejaMisEnLigne);

const nouveauStatut = (statut) => {
  switch (statut) {
    case 'accessible': return 'enLigne';
    case 'nonAccessible': return 'enCours';
    default: return statut;
  }
};

const ancienStatut = (statut) => {
  switch (statut) {
    case 'enLigne': return 'accessible';
    case 'enCours': return 'nonAccessible';
    default: return statut;
  }
};

const modifieStatutDeploiement = (changementStatut) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees?.descriptionService)
      .map(({ id, donnees: { descriptionService, ...autresDonnees } }) => {
        descriptionService.statutDeploiement = changementStatut(
          descriptionService.statutDeploiement
        );
        return knex('homologations')
          .where({ id })
          .update({ donnees: { descriptionService, ...autresDonnees } });
      });
    return Promise.all(misesAJour);
  });

exports.up = modifieStatutDeploiement(nouveauStatut);

exports.down = modifieStatutDeploiement(ancienStatut);

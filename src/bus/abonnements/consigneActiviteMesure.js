const ActiviteMesure = require('../../modeles/activiteMesure');

function consigneActiviteMesure({ depotDonnees }) {
  return async ({ service, utilisateur, ancienneMesure, nouvelleMesure }) => {
    const activiteMesure = new ActiviteMesure({
      service,
      acteur: utilisateur,
      type: 'miseAJourStatut',
      details: {
        ancienStatut: ancienneMesure?.statut,
        nouveauStatut: nouvelleMesure.statut,
      },
    });
    depotDonnees.ajouteActiviteMesure(activiteMesure);
  };
}

module.exports = { consigneActiviteMesure };

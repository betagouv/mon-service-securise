const ActiviteMesure = require('../../modeles/activiteMesure');

function consigneActiviteMesure({ depotDonnees }) {
  return async ({ service, utilisateur, ancienneMesure, nouvelleMesure }) => {
    if (ancienneMesure?.statut === nouvelleMesure.statut) {
      return;
    }
    try {
      const activiteMesure = new ActiviteMesure({
        service,
        acteur: utilisateur,
        type: 'miseAJourStatut',
        details: {
          ancienStatut: ancienneMesure?.statut,
          nouveauStatut: nouvelleMesure.statut,
        },
      });
      await depotDonnees.ajouteActiviteMesure(activiteMesure);
    } catch (e) {
      console.error("Erreur d'ajout d'activité", e);
    }
  };
}

module.exports = { consigneActiviteMesure };

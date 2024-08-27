const ActiviteMesure = require('../../modeles/activiteMesure');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../../adaptateurs/fabriqueAdaptateurGestionErreur');

function consigneActiviteMesure({ depotDonnees }) {
  return async ({ service, utilisateur, ancienneMesure, nouvelleMesure }) => {
    async function ajouteActivite(type, details) {
      try {
        const activiteMesure = new ActiviteMesure({
          service,
          acteur: utilisateur,
          type,
          details,
        });
        await depotDonnees.ajouteActiviteMesure(activiteMesure);
      } catch (e) {
        fabriqueAdaptateurGestionErreur().logueErreur("Erreur d'ajout d'activité", e);
      }
    }

    if (ancienneMesure?.statut !== nouvelleMesure.statut) {
      await ajouteActivite('miseAJourStatut', {
        ancienStatut: ancienneMesure?.statut,
        nouveauStatut: nouvelleMesure.statut,
      });
    } else if (ancienneMesure.priorite !== nouvelleMesure.priorite) {
      await ajouteActivite('ajoutPriorite', {
        nouvellePriorite: nouvelleMesure.priorite,
      });
    }
  };
}

module.exports = { consigneActiviteMesure };

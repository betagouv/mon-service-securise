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
          mesure: nouvelleMesure,
        });
        await depotDonnees.ajouteActiviteMesure(activiteMesure);
      } catch (e) {
        fabriqueAdaptateurGestionErreur().logueErreur(
          "Erreur d'ajout d'activité",
          e
        );
      }
    }

    if (ancienneMesure?.statut !== nouvelleMesure.statut) {
      if (ancienneMesure?.statut) {
        await ajouteActivite('miseAJourStatut', {
          ancienStatut: ancienneMesure?.statut,
          nouveauStatut: nouvelleMesure.statut,
        });
      } else {
        await ajouteActivite('ajoutStatut', {
          nouveauStatut: nouvelleMesure.statut,
        });
      }
    }

    if (ancienneMesure?.priorite !== nouvelleMesure.priorite) {
      if (ancienneMesure?.priorite) {
        await ajouteActivite('miseAJourPriorite', {
          anciennePriorite: ancienneMesure.priorite,
          nouvellePriorite: nouvelleMesure.priorite,
        });
      } else if (nouvelleMesure.priorite) {
        await ajouteActivite('ajoutPriorite', {
          nouvellePriorite: nouvelleMesure.priorite,
        });
      }
    }

    if (
      ancienneMesure?.echeance !== nouvelleMesure.echeance &&
      nouvelleMesure.echeance &&
      !ancienneMesure?.echeance
    ) {
      await ajouteActivite('ajoutEcheance', {
        nouvelleEcheance: nouvelleMesure.echeance,
      });
    }

    if (
      ancienneMesure?.echeance &&
      nouvelleMesure.echeance &&
      ancienneMesure?.echeance !== nouvelleMesure.echeance
    ) {
      await ajouteActivite('miseAJourEcheance', {
        ancienneEcheance: ancienneMesure.echeance,
        nouvelleEcheance: nouvelleMesure.echeance,
      });
    }

    if (ancienneMesure?.echeance && !nouvelleMesure.echeance) {
      await ajouteActivite('suppressionEcheance', {
        ancienneEcheance: ancienneMesure.echeance,
      });
    }
  };
}

module.exports = { consigneActiviteMesure };

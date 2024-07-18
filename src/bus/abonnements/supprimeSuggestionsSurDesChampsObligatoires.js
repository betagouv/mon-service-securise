function supprimeSuggestionsSurDesChampsObligatoires({ depotDonnees }) {
  return async ({ service }) => {
    // Les données pointées par les suggestions d'actions sont des données obligatoires dans le modèle.
    // Cet abonné est déclenché suite à une mise à jour du service…
    // …or le service ne peut être sauvegardé que s'il a toutes les données obligatoires.
    // Donc on acquitte les suggestions d'actions.
    await depotDonnees.acquitteSuggestionAction(service.id, 'miseAJourSiret');
    await depotDonnees.acquitteSuggestionAction(
      service.id,
      'miseAJourNombreOrganisationsUtilisatrices'
    );
  };
}

module.exports = { supprimeSuggestionsSurDesChampsObligatoires };

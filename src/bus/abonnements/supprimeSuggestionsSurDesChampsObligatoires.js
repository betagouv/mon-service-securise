function supprimeSuggestionsSurDesChampsObligatoires({ depotDonnees }) {
  return async ({ service }) => {
    await depotDonnees.acquitteSuggestionAction(service.id, 'miseAJourSiret');
  };
}

module.exports = { supprimeSuggestionsSurDesChampsObligatoires };

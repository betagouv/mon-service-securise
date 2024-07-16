function supprimeSuggestionSiret({ depotDonnees }) {
  return async ({ service }) => {
    await depotDonnees.acquitteSuggestionAction(service.id, 'miseAJourSiret');
  };
}

module.exports = { supprimeSuggestionSiret };

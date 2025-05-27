const creeDepot = ({ adaptateurPersistance }) => {
  const acquitteSuggestionAction = async (idService, natureSuggestion) => {
    await adaptateurPersistance.marqueSuggestionActionFaiteMaintenant(
      idService,
      natureSuggestion
    );
  };

  const ajouteSuggestionAction = async (idService, natureSuggestion) => {
    await adaptateurPersistance.ajouteSuggestionAction({
      idService,
      nature: natureSuggestion,
    });
  };

  const supprimeSuggestionsActionsPourService = async (idService) =>
    adaptateurPersistance.supprimeSuggestionsActionsPourService(idService);

  return {
    acquitteSuggestionAction,
    ajouteSuggestionAction,
    supprimeSuggestionsActionsPourService,
  };
};

module.exports = { creeDepot };

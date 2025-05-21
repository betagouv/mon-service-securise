const creeDepot = ({ adaptateurPersistance }) => {
  const acquitteSuggestionAction = async (idService, natureSuggestion) => {
    await adaptateurPersistance.marqueSuggestionActionFaiteMaintenant(
      idService,
      natureSuggestion
    );
  };

  const ajouteSuggestionAction = async (idService, natureSuggestion) => {
    await adaptateurPersistance.ajouteSuggestionAction(
      idService,
      natureSuggestion
    );
  };

  return { acquitteSuggestionAction, ajouteSuggestionAction };
};

module.exports = { creeDepot };

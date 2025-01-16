const creeDepot = ({ adaptateurPersistance }) => {
  const acquitteSuggestionAction = async (idService, natureSuggestion) => {
    await adaptateurPersistance.marqueSuggestionActionFaiteMaintenant(
      idService,
      natureSuggestion
    );
  };

  return { acquitteSuggestionAction };
};

module.exports = { creeDepot };

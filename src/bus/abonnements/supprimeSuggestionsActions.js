function supprimeSuggestionsActions({ depotDonnees }) {
  return async ({ idService }) => {
    if (!idService)
      throw new Error(
        "Impossible de supprimer les suggestions d'actions d'un service sans avoir l'ID du service en paramètre."
      );

    await depotDonnees.supprimeSuggestionsActionsPourService(idService);
  };
}

export { supprimeSuggestionsActions };

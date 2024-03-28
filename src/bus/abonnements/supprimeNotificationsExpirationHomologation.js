function supprimeNotificationsExpirationHomologation({ depotDonnees }) {
  return async ({ idService }) => {
    if (!idService)
      throw new Error(
        "Impossible de supprimer les notifications d'expiration d'un dossier d'homologation sans avoir l'ID du service en paramètre."
      );

    await depotDonnees.supprimeNotificationsExpirationHomologationPourService(
      idService
    );
  };
}

module.exports = { supprimeNotificationsExpirationHomologation };

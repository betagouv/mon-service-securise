function envoieMailFelicitationHomologation({ depotDonnees, adaptateurMail }) {
  return async ({ idService, dossier }) => {
    if (!idService)
      throw new Error(
        "Impossible d'envoyer le mail de félicitation d'homologation sans avoir l'ID du service en paramètre."
      );
    if (!dossier)
      throw new Error(
        "Impossible d'envoyer le mail de félicitation d'homologation sans avoir le dossier en paramètre."
      );

    if (dossier.decision?.refusee) {
      return;
    }

    const premierProprietaireDe = async (id) => {
      const autorisationProprietaire = (
        await depotDonnees.autorisationsDuService(id)
      ).find((a) => a.estProprietaire);

      const utilisateur = await depotDonnees.utilisateur(
        autorisationProprietaire.idUtilisateur
      );

      return utilisateur.email;
    };

    const destinataire = await premierProprietaireDe(idService);
    await adaptateurMail.envoieMessageFelicitationHomologation(
      destinataire,
      idService
    );
  };
}

export { envoieMailFelicitationHomologation };

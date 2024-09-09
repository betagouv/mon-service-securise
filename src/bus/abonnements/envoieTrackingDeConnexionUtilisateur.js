function envoieTrackingDeConnexionUtilisateur({
  adaptateurTracking,
  depotDonnees,
}) {
  return async (evenement) => {
    const { idUtilisateur } = evenement;

    if (!idUtilisateur)
      throw new Error(
        "Impossible d'envoyer le nombre de services d'un utilisateur à Brevo sans avoir l'identifiant utilisateur en paramètre."
      );

    const utilisateur = await depotDonnees.utilisateur(idUtilisateur);
    const nombreServices = await depotDonnees.nombreServices(idUtilisateur);

    await adaptateurTracking.envoieTrackingConnexion(utilisateur.email, {
      nombreServices,
    });
  };
}

module.exports = { envoieTrackingDeConnexionUtilisateur };

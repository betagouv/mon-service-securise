function metAJourContactBrevoDuContributeur({ crmBrevo, depotDonnees }) {
  return async ({ utilisateur }) => {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }

    const autorisationsUtilisateur = await depotDonnees.autorisations(
      utilisateur.id
    );

    await crmBrevo.metAJourNombresContributionsContact(
      utilisateur,
      autorisationsUtilisateur
    );
  };
}

module.exports = { metAJourContactBrevoDuContributeur };

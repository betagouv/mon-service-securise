function envoieNombreDeServicesDeLUtilisateurABrevo({
  adaptateurMail,
  depotDonnees,
}) {
  return async ({ utilisateur }) => {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }

    const autorisationsUtilisateur = await depotDonnees.autorisations(
      utilisateur.id
    );

    const nombreServicesProprietaire = autorisationsUtilisateur.filter(
      (a) => a.estProprietaire
    ).length;
    const nombreServicesContributeur = autorisationsUtilisateur.filter(
      (a) => !a.estProprietaire
    ).length;

    adaptateurMail.metAJourDonneesContact(utilisateur.email, {
      nombreServicesProprietaire,
      nombreServicesContributeur,
    });
  };
}

module.exports = { envoieNombreDeServicesDeLUtilisateurABrevo };

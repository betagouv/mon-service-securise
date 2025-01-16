function metAJourContactBrevoDeLUtilisateur({ crmBrevo }) {
  return async ({ utilisateur }) => {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo le profil utilisateur sans avoir l'utilisateur en paramètre."
      );
    }

    await crmBrevo.metAJourProfilContact(utilisateur);
  };
}

module.exports = { metAJourContactBrevoDeLUtilisateur };

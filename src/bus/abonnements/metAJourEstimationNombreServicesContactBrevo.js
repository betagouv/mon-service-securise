function metAJourEstimationNombreServicesContactBrevo({ crmBrevo }) {
  return async ({ utilisateur }) => {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo l'estimation du nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }

    await crmBrevo.metAJourEstimationNombreServicesContact(utilisateur);
  };
}

module.exports = { metAJourEstimationNombreServicesContactBrevo };

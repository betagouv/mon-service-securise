const leveException = (raison) => {
  throw new Error(
    `Impossible d'envoyer le nombre de services d'un utilisateur à Brevo sans avoir ${raison} en paramètre.`
  );
};

function envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees }) {
  return async (evenement) => {
    const { utilisateur } = evenement;

    if (!utilisateur) leveException("l'utilisateur");

    const nombreServices = await depotDonnees.nombreServices(utilisateur.id);

    await adaptateurTracking.envoieTrackingNouveauServiceCree(
      utilisateur.email,
      { nombreServices }
    );
  };
}

module.exports = { envoieTrackingDeNouveauService };

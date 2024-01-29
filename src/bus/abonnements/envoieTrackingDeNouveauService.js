function envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees }) {
  return async (evenement) => {
    const { utilisateur } = evenement;

    const services = await depotDonnees.homologations(utilisateur.id);

    await adaptateurTracking.envoieTrackingNouveauServiceCree(
      utilisateur.email,
      { nombreServices: services.length }
    );
  };
}

module.exports = { envoieTrackingDeNouveauService };

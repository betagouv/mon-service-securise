const { fabriqueServiceTracking } = require('../../tracking/serviceTracking');

function envoieTrackingCompletude({ adaptateurTracking, depotDonnees }) {
  return async (evenement) => {
    const serviceTracking = fabriqueServiceTracking();
    const { utilisateur } = evenement;

    const donneesCompletude =
      await serviceTracking.completudeDesServicesPourUtilisateur(
        depotDonnees,
        utilisateur.id
      );

    await adaptateurTracking.envoieTrackingCompletudeService(
      utilisateur.email,
      donneesCompletude
    );
  };
}

module.exports = { envoieTrackingCompletude };

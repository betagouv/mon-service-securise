const { fabriqueServiceTracking } = require('../../tracking/serviceTracking');

const leveException = (raison) => {
  throw new Error(
    `Impossible d'envoyer les données de complétude à Brevo sans avoir ${raison} en paramètre.`
  );
};
function envoieTrackingCompletude({ adaptateurTracking, depotDonnees }) {
  return async (evenement) => {
    const { utilisateur } = evenement;

    if (!utilisateur) leveException("l'utilisateur");

    const serviceTracking = fabriqueServiceTracking();

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

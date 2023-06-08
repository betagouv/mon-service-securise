const envoieTracking = (destinataire, typeEvenement, donneesEvenement = {}) =>
  // eslint-disable-next-line no-console
  console.log(
    `EVENEMENT DE TRACKING: destinataire ${destinataire}, ${typeEvenement}, ${JSON.stringify(
      donneesEvenement
    )} }`
  );

const envoieTrackingConnexion = (destinataire, donneesEvenement) =>
  envoieTracking(destinataire, 'CONNEXION', donneesEvenement);

const envoieTrackingInscription = (destinataire) =>
  envoieTracking(destinataire, 'INSCRIPTION');

module.exports = { envoieTrackingConnexion, envoieTrackingInscription };

const envoieTrackingConnexion = (destinataire, donneesEvenement) =>
  // eslint-disable-next-line no-console
  console.log(
    `EVENEMENT DE TRACKING: destinataire ${destinataire}, 'CONNEXION', ${JSON.stringify(
      donneesEvenement
    )} }`
  );

module.exports = { envoieTrackingConnexion };

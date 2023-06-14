const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const envoieTracking = (destinataire, typeEvenement, donneesEvenement = {}) => {
  const doitLoguer = adaptateurEnvironnement
    .sendinblue()
    .logEvenementsTrackingEnConsole();
  if (doitLoguer) {
    // eslint-disable-next-line no-console
    console.log(
      `EVENEMENT DE TRACKING: destinataire ${destinataire}, ${typeEvenement}, ${JSON.stringify(
        donneesEvenement
      )} }`
    );
  }
};

const envoieTrackingConnexion = (destinataire, donneesEvenement) =>
  envoieTracking(destinataire, 'CONNEXION', donneesEvenement);

const envoieTrackingInscription = (destinataire) =>
  envoieTracking(destinataire, 'INSCRIPTION');

const envoieTrackingInvitationContributeur = (destinataire, donneesEvenement) =>
  envoieTracking(destinataire, 'INVITATION_CONTRIBUTEUR', donneesEvenement);

const envoieTrackingNouveauServiceCree = (destinataire, donneesEvenement) =>
  envoieTracking(destinataire, 'NOUVEAU_SERVICE_CREE', donneesEvenement);

module.exports = {
  envoieTrackingConnexion,
  envoieTrackingInscription,
  envoieTrackingInvitationContributeur,
  envoieTrackingNouveauServiceCree,
};

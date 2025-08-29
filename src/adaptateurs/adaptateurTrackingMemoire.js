import { sendinblue } from './adaptateurEnvironnement.js';

const fabriqueAdaptateurTrackingMemoire = () => {
  const envoieTracking = (
    destinataire,
    typeEvenement,
    donneesEvenement = {}
  ) => {
    const doitLoguer = sendinblue().logEvenementsTrackingEnConsole();

    if (doitLoguer) {
      const donnees = JSON.stringify(donneesEvenement);
      // eslint-disable-next-line no-console
      console.log(
        `EVENEMENT DE TRACKING: destinataire ${destinataire}, ${typeEvenement}, ${donnees} }`
      );
    }
  };

  return {
    envoieTrackingCompletudeService: (destinataire, donneesEvenement) =>
      envoieTracking(destinataire, 'COMPLETUDE_SERVICE_MODIFIEE', {
        donneesEvenement,
      }),
    envoieTrackingConnexion: (destinataire, donneesEvenement) =>
      envoieTracking(destinataire, 'CONNEXION', donneesEvenement),
    envoieTrackingInscription: (destinataire) =>
      envoieTracking(destinataire, 'INSCRIPTION'),
    envoieTrackingInvitationContributeur: (destinataire, donneesEvenement) =>
      envoieTracking(destinataire, 'INVITATION_CONTRIBUTEUR', donneesEvenement),
    envoieTrackingNouveauServiceCree: (destinataire, donneesEvenement) =>
      envoieTracking(destinataire, 'NOUVEAU_SERVICE_CREE', donneesEvenement),
  };
};

export { fabriqueAdaptateurTrackingMemoire };

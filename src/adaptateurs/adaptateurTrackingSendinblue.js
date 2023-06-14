const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const enteteJSON = {
  headers: {
    'ma-key': process.env.SENDINBLUE_TRACKING_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = 'https://in-automate.sendinblue.com/api/v2';

const envoieTracking = (destinataire, typeEvenement, donneesEvenement = {}) =>
  axios
    .post(
      `${urlBase}/trackEvent`,
      {
        email: destinataire,
        event: typeEvenement,
        properties: donneesEvenement,
      },
      enteteJSON
    )
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e);
      // On veut ici délibérement ignorer l'erreur car l'echec de tracking ne devrait pas entrainer une dégradation de l'expérience utilisateur
      return Promise.resolve();
    });

const envoieTrackingConnexion = (destinataire, { nombreServices }) =>
  envoieTracking(destinataire, 'CONNEXION', { nb_services: nombreServices });

const envoieTrackingInscription = (destinataire) =>
  envoieTracking(destinataire, 'INSCRIPTION');

const envoieTrackingInvitationContributeur = (
  destinataire,
  { nombreMoyenContributeurs }
) =>
  envoieTracking(destinataire, 'INVITATION_CONTRIBUTEUR', {
    nb_moyen_contributeurs: nombreMoyenContributeurs,
  });

const envoieTrackingNouveauServiceCree = (destinataire, { nombreServices }) =>
  envoieTracking(destinataire, 'NOUVEAU_SERVICE_CREE', {
    nb_services: nombreServices,
  });

module.exports = {
  envoieTrackingConnexion,
  envoieTrackingInscription,
  envoieTrackingInvitationContributeur,
  envoieTrackingNouveauServiceCree,
};

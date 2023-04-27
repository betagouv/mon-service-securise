const axios = require('axios');

const enteteJSON = {
  headers: {
    'api-key': process.env.SENDINBLUE_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = 'https://api.sendinblue.com/v3';

const creeContact = (
  destinataire, prenom, nom
) => (axios.post(`${urlBase}/contacts`,
  {
    email: destinataire,
    attributes: {
      PRENOM: prenom,
      NOM: nom,
    },
  },
  enteteJSON)
);

const envoieEmail = (
  destinataire, idTemplate, params
) => (axios.post(`${urlBase}/smtp/email`,
  {
    to: [{ email: destinataire }],
    templateId: idTemplate,
    params,
  },
  enteteJSON)
);

const envoieMessageFinalisationInscription = (
  destinataire, idResetMotDePasse, prenom
) => envoieEmail(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_FINALISATION_INSCRIPTION, 10),
  {
    PRENOM: prenom,
    URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
  }
);

const envoieMessageInvitationContribution = (
  destinataire, prenomNomEmetteur, nomService, idService
) => envoieEmail(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_CONTRIBUTION, 10),
  {
    PRENOM: prenomNomEmetteur,
    NOM_SERVICE: nomService,
    URL: `${process.env.URL_BASE_MSS}/service/${idService}`,
  }
);

const envoieMessageInvitationInscription = (
  destinataire, prenomNomEmetteur, nomService, idResetMotDePasse,
) => envoieEmail(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_INSCRIPTION, 10),
  {
    PRENOM: prenomNomEmetteur,
    NOM_SERVICE: nomService,
    URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
  }
);

const envoieMessageReinitialisationMotDePasse = (
  destinataire, idResetMotDePasse
) => envoieEmail(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_REINITIALISATION_MOT_DE_PASSE, 10),
  {
    URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
  }
);

const envoieNotificationTentativeReinscription = (
  destinataire
) => envoieEmail(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_TENTATIVE_REINSCRIPTION, 10),
  {
    URL_INSCRIPTION: `${process.env.URL_BASE_MSS}/inscription`,
    URL_REINITIALISATION_MOT_DE_PASSE: `${process.env.URL_BASE_MSS}/reinitialisationMotDePasse`,
  }
);

module.exports = {
  creeContact,
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationTentativeReinscription,
};

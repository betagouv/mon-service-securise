const axios = require('axios');

const envoieEmailAvecTemplate = (
  destinataire, idTemplate, params
) => (axios.post('https://api.sendinblue.com/v3/smtp/email',
  {
    to: [{ email: destinataire }],
    templateId: idTemplate,
    params,
  },
  { headers: {
    'api-key': process.env.SENDINBLUE_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  } })
);

const envoieMessageFinalisationInscription = (
  destinataire, idResetMotDePasse, prenom
) => envoieEmailAvecTemplate(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_FINALISATION_INSCRIPTION, 10),
  {
    PRENOM: prenom,
    URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
  }
);

const envoieMessageInvitationContribution = (
  destinataire, prenomNomEmetteur, nomService, idHomologation
) => envoieEmailAvecTemplate(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_CONTRIBUTION, 10),
  {
    PRENOM: prenomNomEmetteur,
    NOM_SERVICE: nomService,
    URL: `${process.env.URL_BASE_MSS}/homologation/${idHomologation}`,
  }
);

const envoieMessageInvitationInscription = (
  destinataire, prenomNomEmetteur, nomService, idResetMotDePasse,
) => envoieEmailAvecTemplate(
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
) => envoieEmailAvecTemplate(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_REINITIALISATION_MOT_DE_PASSE, 10),
  {
    URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
  }
);

const envoieNotificationTentativeReinscription = (
  destinataire
) => envoieEmailAvecTemplate(
  destinataire,
  parseInt(process.env.SENDINBLUE_TEMPLATE_TENTATIVE_REINSCRIPTION, 10),
  {
    URL_INSCRIPTION: `${process.env.URL_BASE_MSS}/inscription`,
    URL_REINITIALISATION_MOT_DE_PASSE: `${process.env.URL_BASE_MSS}/reinitialisationMotDePasse`,
  }
);

module.exports = {
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationTentativeReinscription,
};

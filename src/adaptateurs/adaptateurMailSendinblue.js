const axios = require('axios');
const { decode } = require('html-entities');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const enteteJSON = {
  headers: {
    'api-key': process.env.SENDINBLUE_EMAIL_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = 'https://api.brevo.com/v3';

const basculeInfolettre = (destinataire, etat) =>
  axios
    .put(
      `${urlBase}/contacts/${encodeURIComponent(destinataire)}`,
      { emailBlacklisted: etat },
      enteteJSON
    )
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API Brevo': e.response.data,
      });
      return Promise.reject(e);
    });

const desinscrisInfolettre = (destinataire) =>
  basculeInfolettre(destinataire, true);
const inscrisInfolettre = (destinataire) =>
  basculeInfolettre(destinataire, false);

const creeContact = (destinataire, prenom, nom, bloqueEmails) =>
  axios
    .post(
      `${urlBase}/contacts`,
      {
        email: destinataire,
        emailBlacklisted: bloqueEmails,
        attributes: { PRENOM: decode(prenom), NOM: decode(nom) },
        listIds: [
          Number(
            process.env
              .SENDINBLUE_ID_LISTE_POUR_MAILS_TRANSACTIONNELS_DE_RELANCE
          ),
        ],
      },
      enteteJSON
    )
    .catch((e) => {
      if (e.response.data.message === 'Contact already exist')
        return Promise.resolve();

      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API Brevo': e.response.data,
      });
      return Promise.reject(e);
    });

const envoieEmail = (destinataire, idTemplate, params) =>
  axios
    .post(
      `${urlBase}/smtp/email`,
      {
        to: [{ email: destinataire }],
        templateId: idTemplate,
        params,
      },
      enteteJSON
    )
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par SMTP Brevo': e.response.data,
      });
      return Promise.reject(e);
    });

const envoieMessageFinalisationInscription = (
  destinataire,
  idResetMotDePasse,
  prenom
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_FINALISATION_INSCRIPTION, 10),
    {
      PRENOM: decode(prenom),
      URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
    }
  );

const envoieMessageInvitationContribution = (
  destinataire,
  prenomNomEmetteur,
  nomService,
  idService
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_CONTRIBUTION, 10),
    {
      PRENOM: decode(prenomNomEmetteur),
      NOM_SERVICE: decode(nomService),
      URL: `${process.env.URL_BASE_MSS}/service/${idService}`,
    }
  );

const envoieMessageInvitationInscription = (
  destinataire,
  prenomNomEmetteur,
  nomService,
  idResetMotDePasse
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_INSCRIPTION, 10),
    {
      PRENOM: decode(prenomNomEmetteur),
      NOM_SERVICE: decode(nomService),
      URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
    }
  );

const envoieMessageReinitialisationMotDePasse = (
  destinataire,
  idResetMotDePasse
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_REINITIALISATION_MOT_DE_PASSE, 10),
    {
      URL: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
    }
  );

const envoieNotificationTentativeReinscription = (destinataire) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_TENTATIVE_REINSCRIPTION, 10),
    {
      URL_INSCRIPTION: `${process.env.URL_BASE_MSS}/inscription`,
      URL_REINITIALISATION_MOT_DE_PASSE: `${process.env.URL_BASE_MSS}/reinitialisationMotDePasse`,
    }
  );

module.exports = {
  creeContact,
  desinscrisInfolettre,
  inscrisInfolettre,
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationTentativeReinscription,
};

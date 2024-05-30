const axios = require('axios');
const { decode } = require('html-entities');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');
const { ErreurApiBrevo } = require('../erreurs');

const enteteJSON = {
  headers: {
    'api-key': process.env.SENDINBLUE_EMAIL_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = process.env.SENDINBLUE_EMAIL_API_URL_BASE;
const idListeEmailsMarketing = Number(
  process.env.SENDINBLUE_ID_LISTE_POUR_MAILS_TRANSACTIONNELS_DE_RELANCE
);

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

const metAJourDonneesContact = (destinataire, donnees) =>
  axios
    .put(
      `${urlBase}/contacts/${encodeURIComponent(destinataire)}`,
      {
        attributes: donnees,
      },
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

const numeroTelephoneAvecIndicatif = (numero) =>
  numero ? `+33${numero.substring(1)}` : '';

const creeContact = (
  destinataire,
  prenom,
  nom,
  telephone,
  bloqueNewsletter,
  bloqueMarketing
) =>
  axios
    .post(
      `${urlBase}/contacts`,
      {
        email: destinataire,
        emailBlacklisted: bloqueNewsletter,
        attributes: {
          PRENOM: decode(prenom),
          NOM: decode(nom),
          sync_mss_numero_telephone: numeroTelephoneAvecIndicatif(telephone),
        },
        ...(!bloqueMarketing && { listIds: [idListeEmailsMarketing] }),
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

const inscrisEmailsTransactionnels = async (destinataire) => {
  // https://developers.brevo.com/reference/addcontacttolist-1
  const url = new URL(
    `${urlBase}/contacts/lists/${idListeEmailsMarketing}/contacts/add`
  );

  try {
    await axios.post(url.toString(), { emails: [destinataire] }, enteteJSON);
  } catch (e) {
    if (
      e.response.data.message ===
      'Contact already in list and/or does not exist'
    )
      return;

    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API Brevo': e.response.data,
    });
    throw e;
  }
};

const desinscrisEmailsTransactionnels = async (destinataire) => {
  // https://developers.brevo.com/reference/removecontactfromlist
  const url = new URL(
    `${urlBase}/contacts/lists/${idListeEmailsMarketing}/contacts/remove`
  );

  try {
    await axios.post(url.toString(), { emails: [destinataire] }, enteteJSON);
  } catch (e) {
    if (
      e.response.data.message ===
      'Contact already removed from list and/or does not exist'
    )
      return;

    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API Brevo': e.response.data,
    });
    throw e;
  }
};

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
  nbServices
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_CONTRIBUTION, 10),
    {
      emetteur: decode(prenomNomEmetteur),
      nb_services_invitation: Number(nbServices),
      url: `${process.env.URL_BASE_MSS}/tableauDeBord`,
    }
  );

const envoieMessageInvitationInscription = (
  destinataire,
  prenomNomEmetteur,
  idResetMotDePasse,
  nbServices
) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_INVITATION_INSCRIPTION, 10),
    {
      emetteur: decode(prenomNomEmetteur),
      nb_services_invitation: Number(nbServices),
      url: `${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}`,
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

const envoieNotificationExpirationHomologation = (
  destinataire,
  idService,
  delaiAvantExpirationMois
) => {
  const idTemplate =
    delaiAvantExpirationMois === 0
      ? process.env.SENDINBLUE_TEMPLATE_NOTIFICATION_HOMOLOGATION_EXPIREE
      : process.env.SENDINBLUE_TEMPLATE_NOTIFICATION_EXPIRATION_HOMOLOGATION;
  return envoieEmail(destinataire, parseInt(idTemplate, 10), {
    id_service: idService,
    delai_expiration: delaiAvantExpirationMois,
  });
};

const envoieMessageFelicitationHomologation = (destinataire, idService) =>
  envoieEmail(
    destinataire,
    parseInt(process.env.SENDINBLUE_TEMPLATE_FELICITATION_HOMOLOGATION, 10),
    {
      id_service: idService,
    }
  );

const recupereIdentifiantContact = async (email) => {
  const reponse = await axios.get(`${urlBase}/contacts/${email}`, enteteJSON);
  const idContact = reponse?.data?.id;
  if (!idContact) throw new ErreurApiBrevo(`Contact introuvable: ${email}`);
  return idContact;
};

const recupereEntreprise = async (siret) => {
  const reponse = await axios.get(
    `${urlBase}/companies?filters=${encodeURIComponent(
      JSON.stringify({
        'attributes.sync_mss_siret': siret,
      })
    )}`,
    enteteJSON
  );
  if (reponse?.data?.items.length > 1)
    throw new ErreurApiBrevo(`Plusieurs entreprise pour le SIRET: ${siret}`);
  const idEntreprise = reponse?.data?.items[0]?.id;
  return idEntreprise ?? null;
};

const recupereEntrepriseDuContact = async (idContact) => {
  const reponse = await axios.get(
    `${urlBase}/companies?linkedContactsIds=${idContact}`,
    enteteJSON
  );
  if (reponse?.data?.items.length > 1)
    throw new ErreurApiBrevo(
      `Plusieurs entreprise pour le contact: ${idContact}`
    );
  const idEntreprise = reponse?.data?.items[0]?.id;
  return idEntreprise ?? null;
};

const relieContactAEntreprise = async (idContact, idEntreprise) => {
  await axios.patch(
    `${urlBase}/companies/link-unlink/${idEntreprise}`,
    { linkContactIds: [idContact] },
    enteteJSON
  );
};

const supprimeLienEntreContactEtEntreprise = async (
  idContact,
  idEntreprise
) => {
  await axios.patch(
    `${urlBase}/companies/link-unlink/${idEntreprise}`,
    { unlinkContactIds: [idContact] },
    enteteJSON
  );
};

const creeEntreprise = async (siret, nom, natureJuridique) => {
  const reponse = await axios.post(
    `${urlBase}/companies`,
    {
      name: nom,
      attributes: {
        sync_mss_siret: siret,
        sync_mss_nature_juridique: natureJuridique,
      },
    },
    enteteJSON
  );
  const idEntreprise = reponse?.data?.id;
  if (!idEntreprise)
    throw new ErreurApiBrevo(
      `Impossible de créer l'entreprise : ${JSON.stringify({
        siret,
        nom,
        natureJuridique,
      })}`
    );
  return idEntreprise;
};

module.exports = {
  creeContact,
  metAJourDonneesContact,
  creeEntreprise,
  desinscrisEmailsTransactionnels,
  desinscrisInfolettre,
  inscrisEmailsTransactionnels,
  inscrisInfolettre,
  envoieMessageFelicitationHomologation,
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationExpirationHomologation,
  envoieNotificationTentativeReinscription,
  recupereEntreprise,
  recupereEntrepriseDuContact,
  recupereIdentifiantContact,
  relieContactAEntreprise,
  supprimeLienEntreContactEtEntreprise,
};

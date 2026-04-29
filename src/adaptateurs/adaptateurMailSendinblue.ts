import axios, { AxiosError, AxiosResponse } from 'axios';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';
import { enCadence } from '../utilitaires/pThrottle.js';
import { UUID } from '../typesBasiques.js';
import { ErreurApiBrevo } from '../erreurs.js';

const enteteJSON = {
  headers: {
    'api-key': process.env.SENDINBLUE_EMAIL_CLEF_API,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = process.env.SENDINBLUE_EMAIL_API_URL_BASE;
const idListeInfolettre = Number(
  process.env.SENDINBLUE_ID_LISTE_POUR_INFOLETTRE
);

type ErreurBrevo = AxiosError<{ message: string; code: string }>;

const desinscrisInfolettre = async (destinataire: string) => {
  // https://developers.brevo.com/reference/removecontactfromlist
  const url = new URL(
    `${urlBase}/contacts/lists/${idListeInfolettre}/contacts/remove`
  );

  try {
    await axios.post(url.toString(), { emails: [destinataire] }, enteteJSON);
  } catch (e) {
    const erreur = e as ErreurBrevo;
    if (
      erreur.response?.data?.message ===
      'Contact already removed from list and/or does not exist'
    )
      return;

    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
    });
    throw e;
  }
};

const inscrisInfolettre = async (destinataire: string) => {
  // https://developers.brevo.com/reference/addcontacttolist-1
  const url = new URL(
    `${urlBase}/contacts/lists/${idListeInfolettre}/contacts/add`
  );

  try {
    await axios.post(url.toString(), { emails: [destinataire] }, enteteJSON);
  } catch (e) {
    const erreur = e as ErreurBrevo;
    if (
      erreur.response?.data?.message ===
      'Contact already in list and/or does not exist'
    )
      return;

    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
    });
    throw e;
  }
};

const numeroTelephoneAvecIndicatif = (numero: string) =>
  numero ? `+33${numero.substring(1)}` : '';

const creeContact = async (
  destinataire: string,
  prenom: string,
  nom: string,
  telephone: string,
  bloqueNewsletter: boolean,
  bloqueMarketing: boolean
) => {
  const codesErreurTelephone = ['duplicate_parameter', 'invalid_parameter'];

  const construitCorps = (inclutTelephone: boolean) => ({
    updateEnabled: true,
    email: destinataire,
    emailBlacklisted: bloqueMarketing,
    attributes: {
      PRENOM: prenom,
      NOM: nom,
      ...(inclutTelephone && {
        SMS: numeroTelephoneAvecIndicatif(telephone),
      }),
    },
    ...(!bloqueNewsletter && { listIds: [idListeInfolettre] }),
  });

  try {
    await axios.post(`${urlBase}/contacts`, construitCorps(true), enteteJSON);
  } catch (e) {
    const erreur = e as ErreurBrevo;

    if (erreur.response?.data?.message === 'Contact already exist') return;

    if (codesErreurTelephone.includes(erreur.response?.data?.code || '')) {
      await axios.post(
        `${urlBase}/contacts`,
        construitCorps(false),
        enteteJSON
      );
      return;
    }

    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
    });
    throw e;
  }
};

const metAJourDonneesContact = async (
  destinataire: string,
  donnees: Record<string, unknown>
) => {
  const codesErreurTelephone = ['duplicate_parameter', 'invalid_parameter'];

  const requete = (attributs: Record<string, unknown>) =>
    axios.put(
      `${urlBase}/contacts/${encodeURIComponent(destinataire)}`,
      { attributes: attributs },
      enteteJSON
    );

  try {
    await requete(donnees);
  } catch (e) {
    const erreur = e as ErreurBrevo;

    if (codesErreurTelephone.includes(erreur.response?.data?.code || '')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { SMS: _, ...donnesSansTelephone } = donnees;
      await requete(donnesSansTelephone);
      return;
    }

    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
    });
    throw e;
  }
};

const metAJourContact = (
  destinataire: string,
  prenom: string,
  nom: string,
  telephone: string
) =>
  metAJourDonneesContact(destinataire, {
    PRENOM: prenom,
    NOM: nom,
    SMS: numeroTelephoneAvecIndicatif(telephone),
  });

const basculeEmailsTransactionnels = (destinataire: string, etat: boolean) =>
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

const inscrisEmailsTransactionnels = async (destinataire: string) =>
  basculeEmailsTransactionnels(destinataire, false);

const desinscrisEmailsTransactionnels = async (destinataire: string) =>
  basculeEmailsTransactionnels(destinataire, true);

const envoieEmail = (
  destinataire: string,
  idTemplate: number,
  params: Record<string, unknown>
) =>
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

const envoieMessageInvitationContribution = (
  destinataire: string,
  prenomNomEmetteur: string,
  nbServices: string
) =>
  envoieEmail(
    destinataire,
    parseInt(
      process.env.SENDINBLUE_TEMPLATE_INVITATION_CONTRIBUTION as string,
      10
    ),
    {
      emetteur: prenomNomEmetteur,
      nb_services_invitation: Number(nbServices),
      url: `${process.env.URL_BASE_MSS}/tableauDeBord`,
    }
  );

const envoieMessageInvitationInscription = (
  destinataire: string,
  prenomNomEmetteur: string,
  nbServices: number
) =>
  envoieEmail(
    destinataire,
    parseInt(
      process.env.SENDINBLUE_TEMPLATE_INVITATION_INSCRIPTION as string,
      10
    ),
    {
      emetteur: prenomNomEmetteur,
      nb_services_invitation: Number(nbServices),
      url: `${process.env.URL_BASE_MSS}/inscription?invite=true`,
    }
  );

const envoieNotificationExpirationHomologation = (
  destinataire: string,
  idService: UUID,
  delaiAvantExpirationMois: number
) => {
  const idTemplate =
    delaiAvantExpirationMois === 0
      ? (process.env
          .SENDINBLUE_TEMPLATE_NOTIFICATION_HOMOLOGATION_EXPIREE as string)
      : (process.env
          .SENDINBLUE_TEMPLATE_NOTIFICATION_EXPIRATION_HOMOLOGATION as string);
  return envoieEmail(destinataire, parseInt(idTemplate, 10), {
    id_service: idService,
    delai_expiration: delaiAvantExpirationMois,
  });
};

const envoieMessageFelicitationHomologation = (
  destinataire: string,
  idService: UUID
) =>
  envoieEmail(
    destinataire,
    parseInt(
      process.env.SENDINBLUE_TEMPLATE_FELICITATION_HOMOLOGATION as string,
      10
    ),
    {
      id_service: idService,
    }
  );

const recupereIdentifiantContact = async (email: string) => {
  const reponse = await axios.get(`${urlBase}/contacts/${email}`, enteteJSON);
  const idContact = reponse?.data?.id;
  if (!idContact) throw new ErreurApiBrevo(`Contact introuvable: ${email}`);
  return idContact;
};

const recupereEntreprise = async (siret: string) => {
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

const recupereEntrepriseDuContact = async (idContact: string) => {
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

const relieContactAEntreprise = async (
  idContact: string,
  idEntreprise: string
) => {
  try {
    await axios.patch(
      `${urlBase}/companies/link-unlink/${idEntreprise}`,
      { linkContactIds: [idContact] },
      enteteJSON
    );
  } catch (e) {
    const erreur = e as ErreurBrevo;
    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
      'identifiant entreprise': idEntreprise,
      'identifiant contact à lier': idContact,
    });
    throw e;
  }
};

const supprimeLienEntreContactEtEntreprise = async (
  idContact: string,
  idEntreprise: string
) => {
  try {
    await axios.patch(
      `${urlBase}/companies/link-unlink/${idEntreprise}`,
      { unlinkContactIds: [idContact] },
      enteteJSON
    );
  } catch (e) {
    const erreur = e as ErreurBrevo;
    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
      'identifiant entreprise': idEntreprise,
      'identifiant contact à délier': idContact,
    });
    throw e;
  }
};

const creeEntreprise = async (
  siret: string,
  nom: string,
  natureJuridique: string
) => {
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

const supprimeContact = async (email: string) => {
  try {
    await axios.delete(`${urlBase}/contacts/${email}`, enteteJSON);
  } catch (e) {
    const erreur = e as ErreurBrevo;
    fabriqueAdaptateurGestionErreur().logueErreur(erreur, {
      'Erreur renvoyée par API Brevo': erreur.response?.data,
    });
    throw e;
  }
};

// On limite les prochains méthodes à 3 appels par seconde pour ne pas prendre de 429 de Brevo.
let cadenceMiseAJourContact: (
  destinataire: string,
  donnees: Record<string, unknown>
) => Promise<void>;
const metAJourDonneesContactCadencee = async (
  destinataire: string,
  donnees: Record<string, unknown>
) => {
  if (!cadenceMiseAJourContact)
    cadenceMiseAJourContact = enCadence<[string, Record<string, unknown>]>(
      300,
      metAJourDonneesContact
    );
  await cadenceMiseAJourContact(destinataire, donnees);
};

let cadenceEnvoieNotification: (
  destinataire: string,
  idService: UUID,
  delaiAvantExpirationMois: number
) => Promise<AxiosResponse>;
const envoieNotificationExpirationHomologationCadencee = async (
  destinataire: string,
  idService: UUID,
  delaiAvantExpirationMois: number
) => {
  if (!cadenceEnvoieNotification)
    cadenceEnvoieNotification = enCadence<
      [string, UUID, number],
      AxiosResponse
    >(300, envoieNotificationExpirationHomologation);
  await cadenceEnvoieNotification(
    destinataire,
    idService,
    delaiAvantExpirationMois
  );
};

export {
  creeContact,
  metAJourContact,
  metAJourDonneesContactCadencee as metAJourDonneesContact,
  creeEntreprise,
  desinscrisEmailsTransactionnels,
  desinscrisInfolettre,
  inscrisEmailsTransactionnels,
  inscrisInfolettre,
  envoieMessageFelicitationHomologation,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieNotificationExpirationHomologationCadencee as envoieNotificationExpirationHomologation,
  recupereEntreprise,
  recupereEntrepriseDuContact,
  recupereIdentifiantContact,
  relieContactAEntreprise,
  supprimeContact,
  supprimeLienEntreContactEtEntreprise,
};

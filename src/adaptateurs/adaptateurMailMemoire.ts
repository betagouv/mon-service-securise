import { emailMemoire } from './adaptateurEnvironnement.js';

const fabriqueAdaptateurMailMemoire = () => {
  const doitLoguer = emailMemoire().logEmailDansConsole();

  const envoyer = (texte: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    if (doitLoguer) console.log(texte, args);
  };

  const creeContact = async (...args: unknown[]) => {
    envoyer("Création d'un contact email", args);
  };

  const metAJourContact = async (...args: unknown[]) => {
    envoyer('Mise à jour du contact email', args);
  };

  const metAJourDonneesContact = async (...args: unknown[]) => {
    envoyer("Mise à jour des données d'un contact email", args);
  };

  const desinscrisInfolettre = async (...args: unknown[]) => {
    envoyer("Désinscription de l'infolettre MSS", args);
  };

  const inscrisInfolettre = async (...args: unknown[]) => {
    envoyer("Inscription à l'infolettre MSS", args);
  };

  const desinscrisEmailsTransactionnels = async (destinataire: string) => {
    envoyer('Désinscription des emails transactionnels', destinataire);
  };

  const inscrisEmailsTransactionnels = async (...args: unknown[]) => {
    envoyer('Inscription aux emails transactionnels', args);
  };

  const envoieMessageInvitationContribution = async (...args: unknown[]) => {
    envoyer("Envoie de l'email d'invitation à contribuer", args);
  };

  const envoieMessageInvitationInscription = async (...args: unknown[]) => {
    envoyer("Envoie de l'email d'invitation à s'inscrire", args);
  };

  const envoieNotificationExpirationHomologation = async (
    ...args: unknown[]
  ) => {
    envoyer(
      "Envoie de l'email de notification d'expiration d'homologation",
      args
    );
  };

  const envoieMessageFelicitationHomologation = async (...args: unknown[]) => {
    envoyer("Envoie de l'email de félicitation d'homologation", args);
  };

  const recupereIdentifiantContact = async (email: string) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Récupération de l'identifiant Brevo pour l'utilisateur ${email}`
      );
    return 42;
  };

  const recupereEntreprise = async (siret: string) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(`Récupération de l'entreprise Brevo pour le SIRET ${siret}`);
  };

  const recupereEntrepriseDuContact = async (idContact: string) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Récupération de l'entreprise Brevo pour le contact ${idContact}`
      );
  };

  const relieContactAEntreprise = async (
    idContact: string,
    idEntreprise: string
  ) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Relie l'utilisateur ${idContact} à l'entreprise Brevo ${idEntreprise}`
      );
  };

  const supprimeLienEntreContactEtEntreprise = async (
    idContact: string,
    idEntreprise: string
  ) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Supprime le lien entre l'utilisateur ${idContact} à l'entreprise Brevo ${idEntreprise}`
      );
  };

  const creeEntreprise = async (...args: unknown[]) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Création d'une entreprise Brevo avec les paramètres: ${JSON.stringify(
          args
        )}`
      );
  };

  const supprimeContact = async (email: string) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(`Suppression du contact ${email}`);
  };

  return {
    creeContact,
    metAJourContact,
    metAJourDonneesContact,
    creeEntreprise,
    desinscrisEmailsTransactionnels,
    desinscrisInfolettre,
    inscrisEmailsTransactionnels,
    inscrisInfolettre,
    envoieMessageFelicitationHomologation,
    envoieMessageInvitationContribution,
    envoieMessageInvitationInscription,
    envoieNotificationExpirationHomologation,
    recupereEntreprise,
    recupereEntrepriseDuContact,
    recupereIdentifiantContact,
    relieContactAEntreprise,
    supprimeContact,
    supprimeLienEntreContactEtEntreprise,
  };
};

export { fabriqueAdaptateurMailMemoire };

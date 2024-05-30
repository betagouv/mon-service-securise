const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const fabriqueAdaptateurMailMemoire = () => {
  const doitLoguer = adaptateurEnvironnement
    .emailMemoire()
    .logEmailDansConsole();

  const envoyer = (texte, args) => {
    // eslint-disable-next-line no-console
    if (doitLoguer) console.log(texte, args);
  };

  const creeContact = async (...args) => {
    envoyer("Création d'un contact email", args);
  };

  const metAJourContact = async (...args) => {
    envoyer('Mise à jour du contact email', args);
  };

  const metAJourDonneesContact = async (...args) => {
    envoyer("Mise à jour des données d'un contact email", args);
  };

  const desinscrisInfolettre = async (...args) => {
    envoyer("Désinscription de l'infolettre MSS", args);
  };

  const inscrisInfolettre = async (...args) => {
    envoyer("Inscription à l'infolettre MSS", args);
  };

  const desinscrisEmailsTransactionnels = async (...args) => {
    envoyer('Désinscription des emails transactionnels', args);
  };

  const inscrisEmailsTransactionnels = async (...args) => {
    envoyer('Inscription aux emails transactionnels', args);
  };

  const envoieMessageFinalisationInscription = async (...args) => {
    envoyer("Envoie de l'email de finalisation de l'inscription", args);
  };

  const envoieMessageInvitationContribution = async (...args) => {
    envoyer("Envoie de l'email d'invitation à contribuer", args);
  };

  const envoieMessageInvitationInscription = async (...args) => {
    envoyer("Envoie de l'email d'invitation à s'inscrire", args);
  };

  const envoieMessageReinitialisationMotDePasse = async (...args) => {
    envoyer("Envoie de l'email de réinitialisation du mot de passe", args);
  };

  const envoieNotificationTentativeReinscription = async (...args) => {
    envoyer(
      "Envoie de l'email de notification de tentative de réinscription",
      args
    );
  };

  const envoieNotificationExpirationHomologation = async (...args) => {
    envoyer(
      "Envoie de l'email de notification d'expiration d'homologation",
      args
    );
  };

  const envoieMessageFelicitationHomologation = async (...args) => {
    envoyer("Envoie de l'email de félicitation d'homologation", args);
  };

  const recupereIdentifiantContact = async (email) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Récupération de l'identifiant Brevo pour l'utilisateur ${email}`
      );
    return 42;
  };

  const recupereEntreprise = async (siret) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(`Récupération de l'entreprise Brevo pour le SIRET ${siret}`);
  };

  const recupereEntrepriseDuContact = async (idContact) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Récupération de l'entreprise Brevo pour le contact ${idContact}`
      );
  };

  const relieContactAEntreprise = async (idContact, idEntreprise) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Relie l'utilisateur ${idContact} à l'entreprise Brevo ${idEntreprise}`
      );
  };

  const supprimeLienEntreContactEtEntreprise = async (
    idContact,
    idEntreprise
  ) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Supprime le lien entre l'utilisateur ${idContact} à l'entreprise Brevo ${idEntreprise}`
      );
  };

  const creeEntreprise = async (...args) => {
    if (doitLoguer)
      // eslint-disable-next-line no-console
      console.log(
        `Création d'une entreprise Brevo avec les paramètres: ${JSON.stringify(
          args
        )}`
      );
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
};

module.exports = { fabriqueAdaptateurMailMemoire };

/* eslint-disable no-console */

const creeContact = (...args) => {
  console.log("Création d'un contact email", args);
  return Promise.resolve();
};

const desinscrisInfolettre = (...args) => {
  console.log("Désinscription de l'infolettre MSS", args);
  return Promise.resolve();
};

const inscrisInfolettre = (...args) => {
  console.log("Inscription à l'infolettre MSS", args);
  return Promise.resolve();
};

const envoieMessageFinalisationInscription = (...args) => {
  console.log("Envoie de l'email de finalisation de l'inscription", args);
  return Promise.resolve();
};

const envoieMessageInvitationContribution = (...args) => {
  console.log("Envoie de l'email d'invitation à contribuer", args);
  return Promise.resolve();
};

const envoieMessageInvitationInscription = (...args) => {
  console.log("Envoie de l'email d'invitation à s'inscrire", args);
  return Promise.resolve();
};

const envoieMessageReinitialisationMotDePasse = (...args) => {
  console.log("Envoie de l'email de réinitialisation du mot de passe", args);
  return Promise.resolve();
};

const envoieNotificationTentativeReinscription = (...args) => {
  console.log("Envoie de l'email de notification de tentative de réinscription", args);
  return Promise.resolve();
};

/* eslint-enable no-console */

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

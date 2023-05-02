const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const envoyer = (texte, args) => {
  const doitLoguer = adaptateurEnvironnement.emailMemoire().logEmailDansConsole();

  // eslint-disable-next-line no-console
  if (doitLoguer) console.log(texte, args);
};

const creeContact = (...args) => {
  envoyer("Création d'un contact email", args);
  return Promise.resolve();
};

const desinscrisInfolettre = (...args) => {
  envoyer("Désinscription de l'infolettre MSS", args);
  return Promise.resolve();
};

const inscrisInfolettre = (...args) => {
  envoyer("Inscription à l'infolettre MSS", args);
  return Promise.resolve();
};

const envoieMessageFinalisationInscription = (...args) => {
  envoyer("Envoie de l'email de finalisation de l'inscription", args);
  return Promise.resolve();
};

const envoieMessageInvitationContribution = (...args) => {
  envoyer("Envoie de l'email d'invitation à contribuer", args);
  return Promise.resolve();
};

const envoieMessageInvitationInscription = (...args) => {
  envoyer("Envoie de l'email d'invitation à s'inscrire", args);
  return Promise.resolve();
};

const envoieMessageReinitialisationMotDePasse = (...args) => {
  envoyer("Envoie de l'email de réinitialisation du mot de passe", args);
  return Promise.resolve();
};

const envoieNotificationTentativeReinscription = (...args) => {
  envoyer("Envoie de l'email de notification de tentative de réinscription", args);
  return Promise.resolve();
};

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

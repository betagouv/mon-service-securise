const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const fabriqueAdaptateurMailMemoire = () => {
  const envoyer = (texte, args) => {
    const doitLoguer = adaptateurEnvironnement
      .emailMemoire()
      .logEmailDansConsole();

    // eslint-disable-next-line no-console
    if (doitLoguer) console.log(texte, args);
  };

  const creeContact = async (...args) => {
    envoyer("Création d'un contact email", args);
  };

  const desinscrisInfolettre = async (...args) => {
    envoyer("Désinscription de l'infolettre MSS", args);
  };

  const inscrisInfolettre = async (...args) => {
    envoyer("Inscription à l'infolettre MSS", args);
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

  return {
    creeContact,
    desinscrisInfolettre,
    inscrisInfolettre,
    envoieMessageFinalisationInscription,
    envoieMessageInvitationContribution,
    envoieMessageInvitationInscription,
    envoieMessageReinitialisationMotDePasse,
    envoieNotificationTentativeReinscription,
  };
};

module.exports = { fabriqueAdaptateurMailMemoire };

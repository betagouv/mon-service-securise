const nodemailer = require('nodemailer');

const configurationDKIM = () => {
  const configurationDKIMPresente = process.env.NOM_DOMAINE_DKIM
    && process.env.CLEF_DKIM
    && process.env.CLEF_PRIVEE_DKIM;
  if (!configurationDKIMPresente) return {};

  return {
    dkim: {
      domainName: process.env.NOM_DOMAINE_DKIM,
      keySelector: process.env.CLEF_DKIM,
      privateKey: process.env.CLEF_PRIVEE_DKIM,
    },
  };
};

const creeTransport = () => nodemailer.createTransport({
  host: process.env.URL_SERVEUR_SMTP,
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN_SERVEUR_SMTP,
    pass: process.env.MOT_DE_PASSE_SERVEUR_SMTP,
  },
  ...configurationDKIM(),
});

const envoieMessageFinalisationInscription = (destinataire, idResetMotDePasse) => {
  const transport = creeTransport();

  return transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé – Activation du compte',
    text: `Bonjour,

Suite à votre demande de création de compte, cliquez sur le lien d'activation pour
finaliser votre inscription :
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Nous vous remercions pour l'intérêt que vous portez à notre service.

L'équipe MonServiceSécurisé`,
  });
};

const envoieMessageInvitationContribution = (
  destinataire, prenomNomEmetteur, nomService, idHomologation
) => {
  const transport = creeTransport();

  return transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé – Invitation à contribuer',
    text: `Bonjour,

${prenomNomEmetteur} vous invite à rejoindre le dossier d'homologation de sécurité « ${nomService} ».
Pour découvrir et commencer à contribuer au projet :
- allez dans votre espace personnel
- ou cliquez sur ce lien : ${process.env.URL_BASE_MSS}/homologation/${idHomologation}

Nous vous remercions pour l'intérêt que vous portez à notre service.

L'équipe MonServiceSécurisé`,
  });
};

const envoieMessageInvitationInscription = (
  destinataire, prenomNomEmetteur, nomService, idResetMotDePasse,
) => {
  const transport = creeTransport();

  return transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé – Invitation à contribuer',
    text: `Bonjour,

${prenomNomEmetteur} vous invite à rejoindre le dossier d'homologation de sécurité « ${nomService} ».
Votre compte personnel a été créé pour découvrir et commencer à contribuer au projet.
Cliquez sur ce lien pour finaliser votre inscription : ${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Nous vous remercions pour l'intérêt que vous portez à notre service.

L'équipe MonServiceSécurisé`,
  });
};

const envoieMessageReinitialisationMotDePasse = (destinataire, idResetMotDePasse) => {
  const transport = creeTransport();

  return transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé – Changement du mot de passe',
    text: `Bonjour,

Suite à votre demande de réinitialisation du mot de passe, cliquez sur ce lien
pour en définir un nouveau :
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Si vous n'êtes pas l'origine de cette demande, votre compte est sécurisé et
vous pouvez ignorer cet e-mail.

N'hésitez pas à nous contacter pour toutes précisions.

L'équipe MonServiceSécurisé`,
  });
};

const envoieNotificationTentativeReinscription = (destinataire) => {
  const transport = creeTransport();

  return transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé - Tentative de réinscription',
    text: `Bonjour,

Lors de la création de votre compte utilisateur sur MonServiceSécurisé, l'e-mail que vous avez renseigné est déjà associé à un compte existant.

Si vous souhaitez en créer un nouveau, cliquez sur ce lien :
${process.env.URL_BASE_MSS}/inscription

Si vous souhaitez réinitialiser votre mot de passe, cliquez sur ce lien :
${process.env.URL_BASE_MSS}/reinitialisationMotDePasse

Si vous n'êtes pas l'origine de cette demande, votre compte est sécurisé et vous pouvez ignorer cet e-mail.

N'hésitez pas à nous contacter pour toutes précisions.

L'équipe MonServiceSécurisé`,
  });
};

module.exports = {
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationTentativeReinscription,
};

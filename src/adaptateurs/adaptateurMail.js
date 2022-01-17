const nodemailer = require('nodemailer');

const creeTransport = () => nodemailer.createTransport({
  host: process.env.URL_SERVEUR_SMTP,
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN_SERVEUR_SMTP,
    pass: process.env.MOT_DE_PASSE_SERVEUR_SMTP,
  },
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

const envoieMessageReinitialisationMotDePasse = (destinataire, idResetMotDePasse) => {
  const transport = creeTransport();

  transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'MonServiceSécurisé – Réinitialisation du mot de passe',
    text: `Bonjour,

Nous avons reçu une demande de réinitialisation du mot de passe pour votre
compte MonServiceSécurisé. Pour réinitialiser votre mot de passe, vous devez
en saisir un nouveau à l'URL suivante :
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Si vous n'avez pas demandé cette réinitialisation, vous n'avez rien à faire de
plus. Veuillez simplement ignorer ce message.

Nous restons à votre disposition pour vos éventuelles questions.

L'équipe MonServiceSécurisé`,
  });
};

module.exports = {
  envoieMessageFinalisationInscription,
  envoieMessageReinitialisationMotDePasse,
};

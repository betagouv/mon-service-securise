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

  transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'Finalisation inscription Mon Service Sécurisé',
    text: `Bonjour,

Votre compte Mon Service Sécurisé a été créé !…
Pour finaliser votre inscription, vous devez saisir votre mot de passe à l'URL suivante :
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Merci pour le soutien et l'intérêt que vous portez à Mon Service Sécurisé,
-- Toute l'équipe MSS.`,
  });
};

const envoieMessageReinitialisationMotDePasse = (destinataire, idResetMotDePasse) => {
  const transport = creeTransport();

  transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'Réinitialisation de votre mot de passe Mon Service Sécurisé',
    text: `Bonjour,

Nous avons reçu une demande de réinitialisation du mot de passe pour votre
compte Mon Service Sécurisé. Pour réinitialiser votre mot de passe, vous devez
en saisir un nouveau à l'URL suivante :
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse}

Si vous n'avez pas demandé cette réinitialisation, vous n'avez rien à faire de
plus. Veuillez simplement ignorer ce message.

Nous restons à votre disposition pour vos éventuelles questions,
-- Toute l'équipe MSS.`,
  });
};

module.exports = {
  envoieMessageFinalisationInscription,
  envoieMessageReinitialisationMotDePasse,
};

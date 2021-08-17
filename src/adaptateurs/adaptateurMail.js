const nodemailer = require('nodemailer');

const envoieMessageResetMotDePasse = (destinataire, idResetMotDePasse) => {
  const transport = nodemailer.createTransport({
    host: process.env.URL_SERVEUR_SMTP,
    port: 465,
    secure: true,
    auth: {
      user: process.env.LOGIN_SERVEUR_SMTP,
      pass: process.env.MOT_DE_PASSE_SERVEUR_SMTP,
    },
  });

  transport.sendMail({
    from: process.env.ADRESSE_MAIL_CONTACT,
    to: destinataire,
    subject: 'Finalisation inscription Mon Service Sécurisé',
    text: `Bonjour,

Votre compte Mon Service Sécurisé a été créé !…
Pour finaliser votre inscription, vous devez saisir votre mot de passe à l'URL suivante :
${process.env.URL_BASE_MSS}/finalisationInscription/${idResetMotDePasse}

Merci pour le soutien et l'intérêt que vous portez à Mon Service Sécurisé,
-- Toute l'équipe MSS.`,
  });
};

module.exports = { envoieMessageResetMotDePasse };

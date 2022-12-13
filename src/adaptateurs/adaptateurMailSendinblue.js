const axios = require('axios');

function envoieEmail(destinataire, sujet, corpsHtml) {
  return axios.post('https://api.sendinblue.com/v3/smtp/email',
    {
      sender: { email: process.env.ADRESSE_MAIL_CONTACT },
      to: [{ email: destinataire }],
      subject: sujet,
      htmlContent: `<html><head></head><body><p>${corpsHtml}</p></body></html>`,
    },
    { headers: { 'api-key': process.env.CLEF_API_SENDINBLUE } });
}

const envoieMessageFinalisationInscription = (destinataire, idResetMotDePasse) => envoieEmail(
  destinataire,
  'MonServiceSécurisé – Activation du compte',
  `Bonjour, <br/><br/>
  
Merci de votre intérêt pour notre outil MonServiceSécurisé. 
Pour finaliser votre inscription et accéder à toutes les fonctionnalités de notre service, cliquez sur le lien d'activation ci-dessous : <br/>
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse} <br/><br/>

Nous espérons que vous apprécierez votre expérience sur notre site et que nos outils vous seront utiles. <br/><br/>
Contactez-nous à cette adresse support@monservicesecurise.beta.gouv.fr si vous avez la moindre question.

L'équipe MonServiceSécurisé`
);

const envoieMessageInvitationContribution = (
  destinataire, prenomNomEmetteur, nomService, idHomologation
) => envoieEmail(
  destinataire,
  'MonServiceSécurisé – Invitation à contribuer',
  `Bonjour, <br/><br/>

${prenomNomEmetteur} vous invite à rejoindre le dossier d'homologation de sécurité « ${nomService} ». <br/>
Pour découvrir et commencer à contribuer au projet : <br/>
- allez dans votre espace personnel <br/>
- ou cliquez sur ce lien : ${process.env.URL_BASE_MSS}/homologation/${idHomologation} <br/><br/>

Nous vous remercions pour l'intérêt que vous portez à notre service. <br/><br/>

L'équipe MonServiceSécurisé`
);

const envoieMessageInvitationInscription = (
  destinataire, prenomNomEmetteur, nomService, idResetMotDePasse,
) => envoieEmail(
  destinataire,
  'MonServiceSécurisé – Invitation à contribuer',
  `Bonjour, <br/><br/>

${prenomNomEmetteur} vous invite à rejoindre le dossier d'homologation de sécurité « ${nomService} ». <br/>
Votre compte personnel a été créé pour découvrir et commencer à contribuer au projet. <br/>
Cliquez sur ce lien pour finaliser votre inscription : ${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse} <br/><br/>

Nous vous remercions pour l'intérêt que vous portez à notre service. <br/><br/>

L'équipe MonServiceSécurisé`
);

const envoieMessageReinitialisationMotDePasse = (destinataire, idResetMotDePasse) => envoieEmail(
  destinataire,
  'MonServiceSécurisé – Changement du mot de passe',
  `Bonjour, <br/><br/>

Vous avez demandé à réinitialiser votre mot de passe pour accéder à votre compte MonServiceSécurisé. 
Cliquez sur le lien ci-dessous pour en définir un nouveau :
 : <br/>
${process.env.URL_BASE_MSS}/initialisationMotDePasse/${idResetMotDePasse} <br/><br/>

Si vous n'avez pas fait cette demande, votre compte est toujours sécurisé et vous pouvez ignorer cet e-mail.
Si vous avez des questions, n'hésitez pas à nous contacter à cette adresse support@monservicesecurise.beta.gouv.fr <br/><br/>

N'hésitez pas à nous contacter pour toutes précisions. <br/><br/>

L'équipe MonServiceSécurisé`
);

const envoieNotificationTentativeReinscription = (destinataire) => envoieEmail(
  destinataire,
  'MonServiceSécurisé - Tentative de réinscription',
  `Bonjour, <br/><br/>

Lors de la création de votre compte utilisateur sur MonServiceSécurisé, l'e-mail que vous avez renseigné est déjà associé à un compte existant. <br/><br/>

Si vous souhaitez en créer un nouveau, cliquez sur ce lien : <br/>  
${process.env.URL_BASE_MSS}/inscription <br/><br/>

Si vous souhaitez réinitialiser votre mot de passe, cliquez sur ce lien : <br/>  
${process.env.URL_BASE_MSS}/reinitialisationMotDePasse <br/><br/>

Si vous n'êtes pas l'origine de cette demande, votre compte est sécurisé et vous pouvez ignorer cet e-mail. <br/><br/>

N'hésitez pas à nous contacter pour toutes précisions. <br/><br/>

L'équipe MonServiceSécurisé`
);

module.exports = {
  envoieMessageFinalisationInscription,
  envoieMessageInvitationContribution,
  envoieMessageInvitationInscription,
  envoieMessageReinitialisationMotDePasse,
  envoieNotificationTentativeReinscription,
};

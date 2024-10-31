const { EchecEnvoiMessage } = require('../erreurs');
const SourceAuthentification = require('./sourceAuthentification');

function fabriqueInscriptionUtilisateur(config = {}) {
  const { adaptateurMail, adaptateurTracking, depotDonnees } = config;

  const verifieSuccesEnvoiMessage = async (promesseEnvoiMessage) => {
    try {
      await promesseEnvoiMessage;
    } catch {
      throw new EchecEnvoiMessage();
    }
  };

  const creeContactEmail = async (utilisateur) => {
    await verifieSuccesEnvoiMessage(
      adaptateurMail.creeContact(
        utilisateur.email,
        utilisateur.prenom ?? '',
        utilisateur.nom ?? '',
        utilisateur.telephone ?? '',
        !utilisateur.infolettreAcceptee,
        false
      )
    );
  };

  const envoieMessageFinalisationInscription = async (utilisateur) => {
    await verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageFinalisationInscription(
        utilisateur.email,
        utilisateur.idResetMotDePasse,
        utilisateur.prenom
      )
    );
  };

  const inscrisUtilisateur = async (donnees, source) => {
    await creeContactEmail(donnees);
    const utilisateur = await depotDonnees.nouvelUtilisateur(donnees);
    if (utilisateur.cguAcceptees)
      await depotDonnees.valideAcceptationCGUPourUtilisateur(utilisateur);
    if (source === SourceAuthentification.MSS) {
      await envoieMessageFinalisationInscription(utilisateur);
    }

    await adaptateurTracking.envoieTrackingInscription(utilisateur.email);
    return utilisateur;
  };

  return {
    inscrisUtilisateur,
  };
}

module.exports = { fabriqueInscriptionUtilisateur };

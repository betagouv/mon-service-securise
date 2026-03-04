import { EchecEnvoiMessage } from '../erreurs.js';

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

  const inscrisUtilisateur = async (donnees) => {
    await creeContactEmail(donnees);
    const utilisateur = await depotDonnees.nouvelUtilisateur(donnees);
    await adaptateurTracking.envoieTrackingInscription(utilisateur.email);
    return utilisateur;
  };

  return { inscrisUtilisateur };
}

export { fabriqueInscriptionUtilisateur };

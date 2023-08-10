const {
  EchecAutorisation,
  ErreurAutorisationExisteDeja,
  EchecEnvoiMessage,
} = require('../../erreurs');
const ServiceTracking = require('../../tracking/serviceTracking');

const ajoutContributeurSurService = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
}) => {
  const supprimeUtilisateurSiEchec = async (
    promesseEnvoiMessage,
    utilisateur
  ) => {
    try {
      await promesseEnvoiMessage;
      return utilisateur;
    } catch (e) {
      await depotDonnees.supprimeUtilisateur(utilisateur.id);
      throw new EchecEnvoiMessage();
    }
  };

  const verifiePermission = async (idUtilisateur, idService) => {
    const a = await depotDonnees.autorisationPour(idUtilisateur, idService);
    if (!a.permissionAjoutContributeur) throw new EchecAutorisation();
  };

  return {
    executer: async (emailContributeur, service, emetteur) => {
      const verifieAutorisationInexistante = async (...params) => {
        const existe = await depotDonnees.autorisationExiste(...params);
        if (existe)
          throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
      };

      const creeContributeurSiNecessaire = async (contributeurExistant) => {
        if (contributeurExistant) return contributeurExistant;

        const utilisateur = await depotDonnees.nouvelUtilisateur({
          email: emailContributeur,
          infolettreAcceptee: false,
        });
        await adaptateurMail.creeContact(emailContributeur, '', '', true);

        return utilisateur;
      };

      const informeContributeur = async (
        contributeurAInformer,
        contributeurEstExistant
      ) => {
        if (contributeurEstExistant)
          await adaptateurMail.envoieMessageInvitationContribution(
            contributeurAInformer.email,
            emetteur.prenomNom(),
            service.nomService(),
            service.id
          );
        else
          await supprimeUtilisateurSiEchec(
            adaptateurMail.envoieMessageInvitationInscription(
              contributeurAInformer.email,
              emetteur.prenomNom(),
              service.nomService(),
              contributeurAInformer.idResetMotDePasse
            )
          );
      };

      const inviteContributeur = async (contributeurExistant) => {
        await verifieAutorisationInexistante(
          contributeurExistant?.id,
          service.id
        );
        const c = await creeContributeurSiNecessaire(
          contributeurExistant,
          service.id
        );
        await informeContributeur(c, contributeurExistant);
        return c;
      };

      await verifiePermission(emetteur.id, service.id);
      const contributeur = await depotDonnees.utilisateurAvecEmail(
        emailContributeur
      );
      const c = await inviteContributeur(contributeur);
      await depotDonnees.ajouteContributeurAHomologation(c.id, service.id);

      const nombreMoyenContributeurs =
        await ServiceTracking.creeService().nombreMoyenContributeursPourUtilisateur(
          depotDonnees,
          emetteur.id
        );
      await adaptateurTracking.envoieTrackingInvitationContributeur(
        emailContributeur,
        { nombreMoyenContributeurs }
      );
    },
  };
};

module.exports = { ajoutContributeurSurService };

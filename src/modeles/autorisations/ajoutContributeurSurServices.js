const {
  EchecAutorisation,
  ErreurAutorisationExisteDeja,
  EchecEnvoiMessage,
} = require('../../erreurs');
const { fabriqueServiceTracking } = require('../../tracking/serviceTracking');

const ajoutContributeurSurServices = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
}) => {
  const verifiePermission = async (idUtilisateur, idService) => {
    const a = await depotDonnees.autorisationPour(idUtilisateur, idService);
    if (!a.permissionAjoutContributeur) throw new EchecAutorisation();
  };

  const verifieAutorisationInexistante = async (idUtilisateur, idService) => {
    const existe = await depotDonnees.autorisationExiste(
      idUtilisateur,
      idService
    );
    if (existe)
      throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
  };

  const creeUtilisateur = async (email) => {
    const utilisateur = await depotDonnees.nouvelUtilisateur({
      email,
      infolettreAcceptee: false,
    });
    await adaptateurMail.creeContact(email, '', '', true);
    return utilisateur;
  };

  const informeContributeur = async (
    contributeur,
    contributeurEstExistant,
    emetteur
  ) => {
    if (contributeurEstExistant)
      await adaptateurMail.envoieMessageInvitationContribution(
        contributeur.email,
        emetteur.prenomNom(),
        1
      );
    else
      try {
        await adaptateurMail.envoieMessageInvitationInscription(
          contributeur.email,
          emetteur.prenomNom(),
          contributeur.idResetMotDePasse,
          1
        );
      } catch (e) {
        await depotDonnees.supprimeUtilisateur(contributeur.id);
        throw new EchecEnvoiMessage();
      }
  };

  const envoieTracking = async (emetteur, emailContributeur) => {
    const nombreMoyenContributeurs =
      await fabriqueServiceTracking().nombreMoyenContributeursPourUtilisateur(
        depotDonnees,
        emetteur.id
      );
    await adaptateurTracking.envoieTrackingInvitationContributeur(
      emailContributeur,
      { nombreMoyenContributeurs }
    );
  };

  const recupereParEmail = async (emailContributeur) =>
    depotDonnees.utilisateurAvecEmail(emailContributeur);

  const ajouteContributeur = async (contributeur, service) => {
    await depotDonnees.ajouteContributeurAHomologation(
      contributeur.id,
      service.id
    );
  };

  return {
    executer: async (emailContributeur, services, emetteur) => {
      const [service] = services;
      await verifiePermission(emetteur.id, service.id);
      const utilisateur = await recupereParEmail(emailContributeur);
      await verifieAutorisationInexistante(utilisateur?.id, service.id);

      const dejaInscrit = !!utilisateur;
      const contributeur = dejaInscrit
        ? utilisateur
        : await creeUtilisateur(emailContributeur);

      await ajouteContributeur(contributeur, service);
      await informeContributeur(contributeur, dejaInscrit, emetteur);
      await envoieTracking(emetteur, emailContributeur);
    },
  };
};

module.exports = { ajoutContributeurSurServices };

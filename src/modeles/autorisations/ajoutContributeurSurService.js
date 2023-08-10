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
  const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) =>
    promesseEnvoiMessage
      .then(() => utilisateur)
      .catch(() =>
        depotDonnees
          .supprimeUtilisateur(utilisateur.id)
          .then(() => Promise.reject(new EchecEnvoiMessage()))
      );

  const envoieMessageInvitationContribution = (
    emetteur,
    contributeur,
    service
  ) =>
    adaptateurMail
      .envoieMessageInvitationContribution(
        contributeur.email,
        emetteur.prenomNom(),
        service.nomService(),
        service.id
      )
      .then(() => contributeur);

  const envoieMessageInvitationInscription = (
    emetteur,
    contributeur,
    service
  ) =>
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageInvitationInscription(
        contributeur.email,
        emetteur.prenomNom(),
        service.nomService(),
        contributeur.idResetMotDePasse
      ),
      contributeur
    );

  return {
    executer: (idEmetteur, emailContributeur, idService) => {
      const verifiePermission = (...params) =>
        depotDonnees
          .autorisationPour(...params)
          .then((a) =>
            a.permissionAjoutContributeur
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      const verifieAutorisationInexistante = (...params) =>
        depotDonnees
          .autorisationExiste(...params)
          .then((existe) =>
            existe
              ? Promise.reject(
                  new ErreurAutorisationExisteDeja("L'autorisation existe déjà")
                )
              : Promise.resolve()
          );

      const creeContributeurSiNecessaire = (contributeurExistant) =>
        contributeurExistant
          ? Promise.resolve(contributeurExistant)
          : depotDonnees
              .nouvelUtilisateur({
                email: emailContributeur,
                infolettreAcceptee: false,
              })
              .then((utilisateur) =>
                adaptateurMail
                  .creeContact(emailContributeur, '', '', true)
                  .then(() => utilisateur)
              );

      const informeContributeur = (
        contributeurAInformer,
        contributeurExistant
      ) =>
        Promise.all([
          depotDonnees.utilisateur(idEmetteur),
          depotDonnees.homologation(idService),
        ]).then(([emetteur, service]) =>
          contributeurExistant
            ? envoieMessageInvitationContribution(
                emetteur,
                contributeurAInformer,
                service
              )
            : envoieMessageInvitationInscription(
                emetteur,
                contributeurAInformer,
                service
              )
        );

      const inviteContributeur = (contributeurExistant) =>
        verifieAutorisationInexistante(contributeurExistant?.id, idService)
          .then(() =>
            creeContributeurSiNecessaire(contributeurExistant, idService)
          )
          .then((c) => informeContributeur(c, contributeurExistant));

      return verifiePermission(idEmetteur, idService)
        .then(() => depotDonnees.utilisateurAvecEmail(emailContributeur))
        .then(inviteContributeur)
        .then((c) =>
          depotDonnees.ajouteContributeurAHomologation(c.id, idService)
        )
        .then(() =>
          ServiceTracking.creeService()
            .nombreMoyenContributeursPourUtilisateur(depotDonnees, idEmetteur)
            .then((nombreMoyenContributeurs) =>
              adaptateurTracking.envoieTrackingInvitationContributeur(
                emailContributeur,
                { nombreMoyenContributeurs }
              )
            )
        );
    },
  };
};

module.exports = { ajoutContributeurSurService };

const { EchecAutorisation, EchecEnvoiMessage } = require('../../erreurs');
const { fabriqueServiceTracking } = require('../../tracking/serviceTracking');
const Autorisation = require('./autorisation');

const ajoutContributeurSurServices = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
}) => {
  const verifiePermission = async (idUtilisateur, services) => {
    const verifieLeService = async (service) => {
      const a = await depotDonnees.autorisationPour(idUtilisateur, service.id);
      if (!a.peutGererContributeurs()) throw new EchecAutorisation();
    };

    await Promise.all(services.map(verifieLeService));
  };

  const lesServicesSansAutorisationExistante = async (
    idUtilisateur,
    services
  ) => {
    const autorisationExistePourLeService = async (s) =>
      depotDonnees.autorisationExiste(idUtilisateur, s.id);

    const autorisations = await Promise.all(
      services.map(async (s) => ({
        service: s,
        autorisationExiste: await autorisationExistePourLeService(s),
      }))
    );

    return autorisations
      .filter(({ autorisationExiste }) => autorisationExiste === false)
      .map(({ service }) => service);
  };

  const creeUtilisateur = async (email) => {
    await adaptateurMail.creeContact(email, '', '', '', true, true);
    const utilisateur = await depotDonnees.nouvelUtilisateur({
      email,
      infolettreAcceptee: false,
    });
    return utilisateur;
  };

  const supprimeUtilisateur = async (contributeur) => {
    await depotDonnees.supprimeUtilisateur(contributeur.id);
  };

  const envoieEmailNouvelleContribution = async (
    contributeur,
    emetteur,
    services
  ) => {
    await adaptateurMail.envoieMessageInvitationContribution(
      contributeur.email,
      emetteur.prenomNom(),
      services.length
    );
  };

  const envoieEmailInvitation = async (contributeur, emetteur, services) => {
    try {
      await adaptateurMail.envoieMessageInvitationInscription(
        contributeur.email,
        emetteur.prenomNom(),
        services.length
      );
    } catch (e) {
      throw new EchecEnvoiMessage();
    }
  };

  const envoieTracking = async (emetteur) => {
    const nombreMoyenContributeurs =
      await fabriqueServiceTracking().nombreMoyenContributeursPourUtilisateur(
        depotDonnees,
        emetteur.id
      );
    await adaptateurTracking.envoieTrackingInvitationContributeur(
      emetteur.email,
      { nombreMoyenContributeurs }
    );
  };

  const recupereParEmail = async (emailContributeur) =>
    depotDonnees.utilisateurAvecEmail(emailContributeur);

  const ajouteContributeur = async (contributeur, services, droits) => {
    const ajouteAuService = async (s) => {
      await depotDonnees.ajouteContributeurAuService(
        droits.estProprietaire
          ? Autorisation.NouvelleAutorisationProprietaire({
              idUtilisateur: contributeur.id,
              idService: s.id,
            })
          : Autorisation.NouvelleAutorisationContributeur({
              idUtilisateur: contributeur.id,
              idService: s.id,
              droits,
            })
      );
    };

    await Promise.all(services.map(ajouteAuService));
  };

  const ajouteUtilisateurExistantEnContributeur = async (
    utilisateurExistant,
    cibles,
    droits,
    emetteur
  ) => {
    await ajouteContributeur(utilisateurExistant, cibles, droits);
    await envoieEmailNouvelleContribution(
      utilisateurExistant,
      emetteur,
      cibles
    );
  };

  const inviteNouveauContributeur = async (
    emailNouvelInvite,
    cibles,
    droits,
    emetteur
  ) => {
    const nouvelUtilisateur = await creeUtilisateur(emailNouvelInvite);
    try {
      await envoieEmailInvitation(nouvelUtilisateur, emetteur, cibles);
      await ajouteContributeur(nouvelUtilisateur, cibles, droits);
    } catch (e) {
      if (e instanceof EchecEnvoiMessage) {
        await supprimeUtilisateur(nouvelUtilisateur);
      }
      throw e;
    }
  };

  return {
    executer: async (emailContributeur, services, droits, emetteur) => {
      await verifiePermission(emetteur.id, services);
      const utilisateur = await recupereParEmail(emailContributeur);

      const cibles = await lesServicesSansAutorisationExistante(
        utilisateur?.id,
        services
      );

      const rienAFaire = cibles.length === 0;
      if (rienAFaire) return;

      const dejaInscrit = !!utilisateur;
      if (dejaInscrit)
        await ajouteUtilisateurExistantEnContributeur(
          utilisateur,
          cibles,
          droits,
          emetteur
        );
      else
        await inviteNouveauContributeur(
          emailContributeur,
          cibles,
          droits,
          emetteur
        );
      await envoieTracking(emetteur);
    },
  };
};

module.exports = { ajoutContributeurSurServices };

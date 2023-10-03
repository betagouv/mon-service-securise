const { EchecAutorisation, EchecEnvoiMessage } = require('../../erreurs');
const { fabriqueServiceTracking } = require('../../tracking/serviceTracking');
const AutorisationContributeur = require('./autorisationContributeur');
const { toutDroitsEnEcriture } = require('./gestionDroits');

const ajoutContributeurSurServices = ({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
}) => {
  const verifiePermission = async (idUtilisateur, services) => {
    const verifieLeService = async (service) => {
      const a = await depotDonnees.autorisationPour(idUtilisateur, service.id);
      if (!a.permissionAjoutContributeur) throw new EchecAutorisation();
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
    const utilisateur = await depotDonnees.nouvelUtilisateur({
      email,
      infolettreAcceptee: false,
    });
    await adaptateurMail.creeContact(email, '', '', true, true);
    return utilisateur;
  };

  const informeContributeur = async (
    contributeur,
    contributeurEstExistant,
    emetteur,
    services
  ) => {
    if (contributeurEstExistant)
      await adaptateurMail.envoieMessageInvitationContribution(
        contributeur.email,
        emetteur.prenomNom(),
        services.length
      );
    else
      try {
        await adaptateurMail.envoieMessageInvitationInscription(
          contributeur.email,
          emetteur.prenomNom(),
          contributeur.idResetMotDePasse,
          services.length
        );
      } catch (e) {
        await depotDonnees.supprimeUtilisateur(contributeur.id);
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

  const ajouteContributeur = async (contributeur, services) => {
    const ajouteAuService = async (s) => {
      await depotDonnees.ajouteContributeurAuService(
        new AutorisationContributeur({
          idUtilisateur: contributeur.id,
          idService: s.id,
          droits: toutDroitsEnEcriture(),
        })
      );
    };

    await Promise.all(services.map(ajouteAuService));
  };

  return {
    executer: async (emailContributeur, services, emetteur) => {
      await verifiePermission(emetteur.id, services);
      const utilisateur = await recupereParEmail(emailContributeur);

      const cibles = await lesServicesSansAutorisationExistante(
        utilisateur?.id,
        services
      );

      const rienAFaire = cibles.length === 0;
      if (rienAFaire) return;

      const dejaInscrit = !!utilisateur;
      const contributeur = dejaInscrit
        ? utilisateur
        : await creeUtilisateur(emailContributeur);

      await ajouteContributeur(contributeur, cibles);
      await informeContributeur(contributeur, dejaInscrit, emetteur, cibles);
      await envoieTracking(emetteur);
    },
  };
};

module.exports = { ajoutContributeurSurServices };

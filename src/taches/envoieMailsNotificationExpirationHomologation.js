const {
  fabriqueAdaptateurGestionErreur,
} = require('../adaptateurs/fabriqueAdaptateurGestionErreur');
const Autorisation = require('../modeles/autorisations/autorisation');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = Autorisation;

const rapportExecution = (resultats) => {
  const succes = resultats.filter((r) => r.status === 'fulfilled');
  const echecs = resultats.filter((r) => r.status === 'rejected');
  return {
    nbNotificationsEnvoyees: succes.length,
    nbEchecs: echecs.length,
  };
};

const envoieMailsNotificationExpirationHomologation = async (config = {}) => {
  const { depotDonnees, adaptateurHorloge, adaptateurMail } = config;

  const notifications =
    await depotDonnees.lisNotificationsExpirationHomologationEnDate(
      adaptateurHorloge.maintenant()
    );

  const contributeursDuService = async (idService) => {
    const autorisations = await depotDonnees.autorisationsDuService(idService);
    const autorisationsAvecDroitLectureHomologation = autorisations.filter(
      (a) => a.aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION)
    );
    const utilisateurs = await Promise.all(
      autorisationsAvecDroitLectureHomologation.map((a) =>
        depotDonnees.utilisateur(a.idUtilisateur)
      )
    );

    return utilisateurs.map((u) => u.email);
  };

  const resultats = await Promise.allSettled(
    notifications.map(async (notification) => {
      const destinataires = await contributeursDuService(
        notification.idService
      );

      if (destinataires.length === 0) {
        throw new Error(
          `Aucun destinataire pour le service ${notification.idService}`
        );
      }

      await Promise.all(
        destinataires.map((d) =>
          adaptateurMail.envoieNotificationExpirationHomologation(
            d,
            notification.idService,
            notification.delaiAvantExpirationMois
          )
        )
      );

      await depotDonnees.supprimeNotificationsExpirationHomologation([
        notification.id,
      ]);
    })
  );

  resultats
    .filter((r) => r.status === 'rejected')
    .forEach((r) =>
      fabriqueAdaptateurGestionErreur().logueErreur(new Error(r.reason))
    );

  return rapportExecution(resultats);
};

module.exports = { envoieMailsNotificationExpirationHomologation };

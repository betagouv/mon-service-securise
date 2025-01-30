const {
  fabriqueAdaptateurGestionErreur,
} = require('../adaptateurs/fabriqueAdaptateurGestionErreur');

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
    const utilisateurs = await Promise.all(
      autorisations.map((a) => depotDonnees.utilisateur(a.idUtilisateur))
    );

    return utilisateurs.map((u) => u.email);
  };

  const resultats = await Promise.allSettled(
    notifications.map(async (notification) => {
      try {
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
      } catch (e) {
        fabriqueAdaptateurGestionErreur().logueErreur(e);
        // Throw pour compter un échec dans le rapport d'exécution
        throw e;
      }
    })
  );

  return rapportExecution(resultats);
};

module.exports = { envoieMailsNotificationExpirationHomologation };

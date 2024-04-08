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

  const premierProprietaireDe = async (idService) => {
    const autorisationProprietaire = (
      await depotDonnees.autorisationsDuService(idService)
    ).find((a) => a.estProprietaire);

    const utilisateur = await depotDonnees.utilisateur(
      autorisationProprietaire.idUtilisateur
    );

    return utilisateur.email;
  };

  const resultats = await Promise.allSettled(
    notifications.map(async (notification) => {
      try {
        const destinataire = await premierProprietaireDe(
          notification.idService
        );

        await adaptateurMail.envoieNotificationExpirationHomologation(
          destinataire,
          notification.idService,
          notification.delaiAvantExpirationMois
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

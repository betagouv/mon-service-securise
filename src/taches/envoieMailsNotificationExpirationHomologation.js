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
      const destinataire = await premierProprietaireDe(notification.idService);

      await adaptateurMail.envoieNotificationExpirationHomologation(
        destinataire,
        notification.idService,
        notification.delaiAvantExpirationMois
      );

      await depotDonnees.supprimeNotificationsExpirationHomologation([
        notification.id,
      ]);
    })
  );

  return rapportExecution(resultats);
};

module.exports = { envoieMailsNotificationExpirationHomologation };

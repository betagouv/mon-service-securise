const envoieMailsNotificationExpirationHomologation = async (config = {}) => {
  const { depotDonnees, adaptateurHorloge, adaptateurMail } = config;

  const notifications =
    await depotDonnees.lisNotificationsExpirationHomologationEnDate(
      adaptateurHorloge.maintenant()
    );

  const resultats = await Promise.allSettled(
    notifications.map(async (notification) => {
      const autorisationProprietaire = (
        await depotDonnees.autorisationsDuService(notification.idService)
      ).find((a) => a.estProprietaire);
      const destinataire = (
        await depotDonnees.utilisateur(autorisationProprietaire.idUtilisateur)
      ).email;
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

  return {
    nbNotificationsEnvoyees: resultats.filter((r) => r.status === 'fulfilled')
      .length,
    nbEchecs: resultats.filter((r) => r.status === 'rejected').length,
  };
};

module.exports = { envoieMailsNotificationExpirationHomologation };

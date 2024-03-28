const NotificationExpirationHomologation = require('../../modeles/notificationExpirationHomologation');

function sauvegardeNotificationsExpirationHomologation({
  adaptateurHorloge,
  depotDonnees,
  referentiel,
}) {
  return async ({ idService, dossier }) => {
    if (!idService)
      throw new Error(
        "Impossible de sauvegarder les notifications d'expiration d'un dossier d'homologation sans avoir l'ID du service en paramètre."
      );
    if (!dossier)
      throw new Error(
        "Impossible de sauvegarder les notifications d'expiration d'un dossier d'homologation sans avoir le dossier en paramètre."
      );

    const notifications = NotificationExpirationHomologation.pourUnDossier({
      idService,
      dossier,
      referentiel,
    }).filter((n) => n.dateProchainEnvoi > adaptateurHorloge.maintenant());
    await depotDonnees.supprimeNotificationsExpirationHomologationPourService(
      idService
    );
    await depotDonnees.sauvegardeNotificationsExpirationHomologation(
      notifications
    );
  };
}

module.exports = { sauvegardeNotificationsExpirationHomologation };

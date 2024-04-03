const NotificationExpirationHomologation = require('../modeles/notificationExpirationHomologation');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, adaptateurUUID } = config;

  const lisNotificationsExpirationHomologationEnDate = async (date) => {
    const debutMinuitUTC = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );

    const demainMinuitUTC = new Date(debutMinuitUTC);
    demainMinuitUTC.setDate(demainMinuitUTC.getDate() + 1);

    const resultats =
      await adaptateurPersistance.lisNotificationsExpirationHomologationDansIntervalle(
        debutMinuitUTC.toISOString(),
        demainMinuitUTC.toISOString()
      );

    return resultats.map(
      (donnees) => new NotificationExpirationHomologation(donnees)
    );
  };

  const supprimeNotificationsExpirationHomologationPourService = async (
    idService
  ) => {
    await adaptateurPersistance.supprimeNotificationsExpirationHomologationPourService(
      idService
    );
  };

  const sauvegardeNotificationsExpirationHomologation = async (
    notifications
  ) => {
    if (!notifications.length) return;
    const notificationsAvecId = notifications.map((n) => ({
      ...n.donneesAPersister(),
      id: adaptateurUUID.genereUUID(),
    }));
    await adaptateurPersistance.sauvegardeNotificationsExpirationHomologation(
      notificationsAvecId
    );
  };

  return {
    lisNotificationsExpirationHomologationEnDate,
    sauvegardeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
  };
};

module.exports = { creeDepot };

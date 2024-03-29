const creeDepot = (config = {}) => {
  const { adaptateurPersistance, adaptateurUUID } = config;

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
    sauvegardeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
  };
};

module.exports = { creeDepot };

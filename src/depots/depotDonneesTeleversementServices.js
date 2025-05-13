const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const nouveauTeleversementServices = async (
    idUtilisateur,
    donneesTeleversementServices
  ) =>
    adaptateurPersistance.ajouteTeleversementServices(
      idUtilisateur,
      donneesTeleversementServices
    );

  return {
    nouveauTeleversementServices,
  };
};
module.exports = { creeDepot };

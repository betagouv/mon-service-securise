const creeDepot = (config = {}) => {
  const { adaptateurPersistance, adaptateurChiffrement } = config;

  const nouveauTeleversementServices = async (
    idUtilisateur,
    donneesTeleversementServices
  ) => {
    const donneesChiffrees = await adaptateurChiffrement.chiffre(
      donneesTeleversementServices
    );
    return adaptateurPersistance.ajouteTeleversementServices(
      idUtilisateur,
      donneesChiffrees
    );
  };

  return {
    nouveauTeleversementServices,
  };
};
module.exports = { creeDepot };

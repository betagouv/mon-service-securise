const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance: persistance,
    adaptateurChiffrement: chiffrement,
  } = config;

  const nouveauTeleversementModelesMesureSpecifique = async (
    idUtilisateur,
    donneesTeleversementServices
  ) => {
    const donneesChiffrees = await chiffrement.chiffre(
      donneesTeleversementServices
    );
    await persistance.ajouteTeleversementModelesMesureSpecifique(
      idUtilisateur,
      donneesChiffrees
    );
  };

  return {
    nouveauTeleversementModelesMesureSpecifique,
  };
};

module.exports = { creeDepot };

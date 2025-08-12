const TeleversementModelesMesureSpecifique = require('../modeles/televersement/televersementModelesMesureSpecifique');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance: persistance,
    adaptateurChiffrement: chiffrement,
    referentiel,
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

  const lisTeleversementModelesMesureSpecifique = async (idUtilisateur) => {
    const persistees =
      await persistance.lisTeleversementModelesMesureSpecifique(idUtilisateur);

    if (!persistees) return undefined;

    const enClair = await chiffrement.dechiffre(persistees);
    return new TeleversementModelesMesureSpecifique(enClair, referentiel);
  };

  return {
    nouveauTeleversementModelesMesureSpecifique,
    lisTeleversementModelesMesureSpecifique,
  };
};
module.exports = { creeDepot };

const TeleversementServices = require('../modeles/televersement/televersementServices');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, adaptateurChiffrement, referentiel } = config;

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

  const lisTeleversementServices = async (idUtilisateur) => {
    const donneesChiffrees =
      await adaptateurPersistance.lisTeleversementServices(idUtilisateur);
    if (!donneesChiffrees) return undefined;
    const services = await adaptateurChiffrement.dechiffre(
      donneesChiffrees.donnees.services
    );
    return new TeleversementServices({ services }, referentiel);
  };

  const supprimeTeleversementServices = async (idUtilisateur) =>
    adaptateurPersistance.supprimeTeleversementServices(idUtilisateur);

  const metsAJourProgressionTeleversement = async (
    idUtilisateur,
    progression
  ) =>
    adaptateurPersistance.metsAJourProgressionTeleversement(
      idUtilisateur,
      progression
    );

  return {
    lisTeleversementServices,
    metsAJourProgressionTeleversement,
    nouveauTeleversementServices,
    supprimeTeleversementServices,
  };
};
module.exports = { creeDepot };

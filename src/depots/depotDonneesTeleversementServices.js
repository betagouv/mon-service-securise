import TeleversementServices from '../modeles/televersement/televersementServices.js';

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

  const lisPourcentageProgressionTeleversementServices = async (
    idUtilisateur
  ) => {
    const televersement = await lisTeleversementServices(idUtilisateur);
    if (!televersement) return undefined;

    const { progression } =
      await adaptateurPersistance.lisProgressionTeleversementServices(
        idUtilisateur
      );
    return Math.floor(((progression + 1) / televersement.nombre()) * 100);
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
    lisPourcentageProgressionTeleversementServices,
    lisTeleversementServices,
    metsAJourProgressionTeleversement,
    nouveauTeleversementServices,
    supprimeTeleversementServices,
  };
};
export { creeDepot };

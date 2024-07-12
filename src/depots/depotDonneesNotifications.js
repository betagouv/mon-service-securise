const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    depotServices,
  } = config;

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) =>
    adaptateurPersistance.marqueNouveauteLue(idUtilisateur, idNouveaute);

  const nouveautesPourUtilisateur = async (idUtilisateur) =>
    adaptateurPersistance.nouveautesPourUtilisateur(idUtilisateur);

  const tachesDesServices = async (idUtilisateur) => {
    const servicesUtilisateur =
      await depotServices.homologations(idUtilisateur);

    const taches =
      await adaptateurPersistance.tachesDeServicePour(idUtilisateur);

    return taches.map((t) => {
      const service = servicesUtilisateur.find((s) => s.id === t.idService);
      return { ...t, service };
    });
  };

  const marqueTacheDeServiceLue = async (idTache) => {
    await adaptateurPersistance.marqueTacheDeServiceLue(idTache);
  };

  return {
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    nouveautesPourUtilisateur,
    tachesDesServices,
  };
};

module.exports = { creeDepot };

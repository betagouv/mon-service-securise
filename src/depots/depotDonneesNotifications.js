const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
  } = config;

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) =>
    adaptateurPersistance.marqueNouveauteLue(idUtilisateur, idNouveaute);

  const nouveautesPourUtilisateur = async (idUtilisateur) =>
    adaptateurPersistance.nouveautesPourUtilisateur(idUtilisateur);

  return {
    marqueNouveauteLue,
    nouveautesPourUtilisateur,
  };
};

module.exports = { creeDepot };

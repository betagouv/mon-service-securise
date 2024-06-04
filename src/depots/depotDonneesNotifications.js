const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
  } = config;

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) =>
    adaptateurPersistance.marqueNouveauteLue(idUtilisateur, idNouveaute);

  return {
    marqueNouveauteLue,
  };
};

module.exports = { creeDepot };

const Homologation = require('../modeles/homologation');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, referentiel } = config;
  const homologation = (idService) => adaptateurPersistance.homologation(idService)
    .then((s) => (s ? new Homologation(s, referentiel) : undefined));

  return {
    homologation,
  };
};

module.exports = { creeDepot };

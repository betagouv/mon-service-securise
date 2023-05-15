const Service = require('../modeles/service');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, referentiel } = config;
  const service = (idService) =>
    adaptateurPersistance
      .service(idService)
      .then((s) => (s ? new Service(s, referentiel) : undefined));

  return {
    service,
  };
};

module.exports = { creeDepot };

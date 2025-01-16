const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
  } = config;

  const sauvegardeNouvelIndiceCyber = async ({
    idService,
    indiceCyber,
    indiceCyberPersonnalise,
    mesuresParStatut,
  }) =>
    adaptateurPersistance.sauvegardeNouvelIndiceCyber(
      idService,
      indiceCyber,
      indiceCyberPersonnalise,
      mesuresParStatut
    );

  const lisDernierIndiceCyber = async (idService) =>
    adaptateurPersistance.lisDernierIndiceCyber(idService);

  return { sauvegardeNouvelIndiceCyber, lisDernierIndiceCyber };
};

module.exports = { creeDepot };

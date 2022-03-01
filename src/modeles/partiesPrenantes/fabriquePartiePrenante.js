const DeveloppementFourniture = require('./developpementFourniture');
const Hebergement = require('./hebergement');
const MaintenanceService = require('./maintenanceService');
const PartiePrenanteSpecifique = require('./partiePrenanteSpecifique');
const SecuriteService = require('./securiteService');
const { ErreurTypeInconnu } = require('../../erreurs');

const partiesPrenantesAutorises = [
  DeveloppementFourniture,
  Hebergement,
  MaintenanceService,
  PartiePrenanteSpecifique,
  SecuriteService,
];

const fabriquePartiePrenante = {
  cree: (donnees) => {
    const { type } = donnees;

    if (!partiesPrenantesAutorises.some((classe) => classe.name === type)) {
      throw new ErreurTypeInconnu(`Le type "${type}" est inconnu`);
    }

    const ClassePartiePrenante = partiesPrenantesAutorises.find((classe) => classe.name === type);
    return new ClassePartiePrenante(donnees);
  },
};

module.exports = fabriquePartiePrenante;

const DeveloppementFourniture = require('./developpementFourniture');
const Hebergement = require('./hebergement');
const { ErreurTypeInconnu } = require('../../erreurs');

const fabriquePartiePrenante = {
  cree: (donnees) => {
    const { type } = donnees;
    switch (type) {
      case Hebergement.name: return new Hebergement(donnees);
      case DeveloppementFourniture.name: return new DeveloppementFourniture(donnees);
      default: throw new ErreurTypeInconnu(`Le type "${type}" est inconnu`);
    }
  },
};

module.exports = fabriquePartiePrenante;

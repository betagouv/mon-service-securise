const Hebergement = require('./hebergement');
const { ErreurTypeInconnu } = require('../../erreurs');

const fabriquePartiePrenante = {
  cree: (donnees) => {
    const { type } = donnees;
    if (type !== 'Hebergement') throw new ErreurTypeInconnu(`Le type "${type}" est inconnu`);
    return new Hebergement(donnees);
  },
};

module.exports = fabriquePartiePrenante;

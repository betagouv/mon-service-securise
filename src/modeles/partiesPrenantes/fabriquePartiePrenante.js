const PartiePrenante = require('./partiePrenante');

const fabriquePartiePrenante = {
  cree: (donnees) => new PartiePrenante(donnees),
};

module.exports = fabriquePartiePrenante;

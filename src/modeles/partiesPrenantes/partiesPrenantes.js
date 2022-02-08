const ElementsConstructibles = require('../elementsConstructibles');
const PartiePrenante = require('./partiePrenante');

class PartiesPrenantes extends ElementsConstructibles {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(PartiePrenante, { items: partiesPrenantes });
  }
}

module.exports = PartiesPrenantes;

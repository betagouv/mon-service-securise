const ElementsFabricables = require('../elementsFabricables');
const fabriquePartiePrenante = require('./fabriquePartiePrenante');
const { estHebergement } = require('./typePartiePrenante');

class PartiesPrenantes extends ElementsFabricables {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }

  hebergement() {
    return this.tous().find(estHebergement)?.toJSON();
  }
}

module.exports = PartiesPrenantes;

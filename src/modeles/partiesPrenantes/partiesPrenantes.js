const ElementsFabricables = require('../elementsFabricables');
const fabriquePartiePrenante = require('./fabriquePartiePrenante');

class PartiesPrenantes extends ElementsFabricables {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }
}

module.exports = PartiesPrenantes;

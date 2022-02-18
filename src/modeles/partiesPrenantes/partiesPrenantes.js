const ElementsFabricables = require('../elementsFabricables');
const fabriquePartiePrenante = require('./fabriquePartiePrenante');
const { estDeveloppementFourniture, estHebergement, estSpecifique } = require('./typePartiePrenante');

class PartiesPrenantes extends ElementsFabricables {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }

  type(estType) {
    return this.tous().find(estType)?.toJSON();
  }

  hebergement() {
    return this.type(estHebergement);
  }

  developpementFourniture() {
    return this.type(estDeveloppementFourniture);
  }

  specifiques() {
    return this.tous()
      .filter(estSpecifique)
      .map((partiePrenante) => partiePrenante.toJSON());
  }
}

module.exports = PartiesPrenantes;

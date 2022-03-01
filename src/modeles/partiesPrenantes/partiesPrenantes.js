const DeveloppementFourniture = require('./developpementFourniture');
const Hebergement = require('./hebergement');
const PartiePrenanteSpecifique = require('./partiePrenanteSpecifique');
const ElementsFabricables = require('../elementsFabricables');
const fabriquePartiePrenante = require('./fabriquePartiePrenante');

class PartiesPrenantes extends ElementsFabricables {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }

  type(Type) {
    return this.toutes().find((partiePrenante) => partiePrenante.estDeType(Type))?.toJSON();
  }

  hebergement() {
    return this.type(Hebergement);
  }

  developpementFourniture() {
    return this.type(DeveloppementFourniture);
  }

  specifiques() {
    return this.toutes()
      .filter((partiePrenante) => partiePrenante.estDeType(PartiePrenanteSpecifique))
      .map((partiePrenante) => partiePrenante.toJSON());
  }
}

module.exports = PartiesPrenantes;

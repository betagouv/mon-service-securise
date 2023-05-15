const DeveloppementFourniture = require('./developpementFourniture');
const ElementsFabricables = require('../elementsFabricables');
const Hebergement = require('./hebergement');
const MaintenanceService = require('./maintenanceService');
const PartiePrenante = require('./partiePrenante');
const PartiePrenanteSpecifique = require('./partiePrenanteSpecifique');
const SecuriteService = require('./securiteService');
const fabriquePartiePrenante = require('./fabriquePartiePrenante');

class PartiesPrenantes extends ElementsFabricables {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }

  type(Type) {
    return this.toutes()
      .find((partiePrenante) => partiePrenante.estDeType(Type))
      ?.toJSON();
  }

  hebergement() {
    return this.type(Hebergement);
  }

  developpementFourniture() {
    return this.type(DeveloppementFourniture);
  }

  maintenanceService() {
    return this.type(MaintenanceService);
  }

  securiteService() {
    return this.type(SecuriteService);
  }

  specifiques() {
    return this.toutes()
      .filter((partiePrenante) =>
        partiePrenante.estDeType(PartiePrenanteSpecifique)
      )
      .map((partiePrenante) => partiePrenante.toJSON());
  }

  static proprietesItem() {
    return PartiePrenante.proprietes();
  }
}

module.exports = PartiesPrenantes;

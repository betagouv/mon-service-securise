import DeveloppementFourniture from './developpementFourniture.js';
import ElementsFabricables from '../elementsFabricables.js';
import Hebergement from './hebergement.js';
import MaintenanceService from './maintenanceService.js';
import PartiePrenante from './partiePrenante.js';
import PartiePrenanteSpecifique from './partiePrenanteSpecifique.js';
import SecuriteService from './securiteService.js';
import { fabriquePartiePrenante } from './fabriquePartiePrenante.js';

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

export default PartiesPrenantes;

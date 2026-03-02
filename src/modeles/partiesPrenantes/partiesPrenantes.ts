import DeveloppementFourniture from './developpementFourniture.js';
import ElementsFabricables from '../elementsFabricables.js';
import Hebergement from './hebergement.js';
import MaintenanceService from './maintenanceService.js';
import PartiePrenante, { DonneesPartiePrenante } from './partiePrenante.js';
import PartiePrenanteSpecifique from './partiePrenanteSpecifique.js';
import SecuriteService from './securiteService.js';
import { fabriquePartiePrenante } from './fabriquePartiePrenante.js';

type DonneesPartiesPrenantes = {
  partiesPrenantes: Array<DonneesPartiePrenante & { type: string }>;
};

class PartiesPrenantes extends ElementsFabricables<PartiePrenante> {
  constructor(donnees: Partial<DonneesPartiesPrenantes> = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(fabriquePartiePrenante, { items: partiesPrenantes });
  }

  type(Type: { name: string } | null) {
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

import type Service from '../modeles/service.js';

class EvenementSimulationMigrationReferentielCreee {
  service: Service;

  constructor({ service }: { service: Service }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");

    this.service = service;
  }
}

export default EvenementSimulationMigrationReferentielCreee;

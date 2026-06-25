import Service from '../modeles/service.js';

class EvenementRisqueServiceModifie {
  readonly service: Service;

  constructor({ service }: { service: Service }) {
    if (!service) {
      throw new Error("Impossible d'instancier l'événement sans service");
    }
    this.service = service;
  }
}
export default EvenementRisqueServiceModifie;

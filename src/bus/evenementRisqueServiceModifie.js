class EvenementRisqueServiceModifie {
  constructor({ service }) {
    if (!service) {
      throw new Error("Impossible d'instancier l'événement sans service");
    }
    this.service = service;
  }
}
export default EvenementRisqueServiceModifie;

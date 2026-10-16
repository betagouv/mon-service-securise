class EvenementServiceSupprime {
  constructor({ idService, autorisations, siret }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    this.idService = idService;
    this.autorisations = autorisations;
    this.siret = siret;
  }
}

export default EvenementServiceSupprime;

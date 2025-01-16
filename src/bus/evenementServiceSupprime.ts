class EvenementServiceSupprime {
  constructor({ idService, autorisations }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    this.idService = idService;
    this.autorisations = autorisations;
  }
}

module.exports = EvenementServiceSupprime;

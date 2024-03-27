class EvenementServiceSupprime {
  constructor({ idService }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    this.idService = idService;
  }
}

module.exports = EvenementServiceSupprime;

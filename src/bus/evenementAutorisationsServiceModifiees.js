class EvenementAutorisationsServiceModifiees {
  constructor({ idService, autorisations }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");
    if (!autorisations || autorisations.length === 0)
      throw Error("Impossible d'instancier l'événement sans autorisations");

    this.idService = idService;
    this.autorisations = autorisations;
  }
}

module.exports = { EvenementAutorisationsServiceModifiees };

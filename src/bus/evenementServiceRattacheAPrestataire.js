class EvenementServiceRattacheAPrestataire {
  constructor({ idService, codePrestataire }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans idService");
    if (!codePrestataire)
      throw Error("Impossible d'instancier l'événement sans codePrestataire");

    this.idService = idService;
    this.codePrestataire = codePrestataire;
  }
}

export { EvenementServiceRattacheAPrestataire };

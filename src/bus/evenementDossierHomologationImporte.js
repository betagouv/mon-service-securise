class EvenementDossierHomologationImporte {
  constructor({ idService, dossier }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    if (!dossier)
      throw Error("Impossible d'instancier l'événement sans dossier");

    this.idService = idService;
    this.dossier = dossier;
    this.importe = true;
  }
}

export default EvenementDossierHomologationImporte;

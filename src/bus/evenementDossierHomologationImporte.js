class EvenementDossierHomologationImporte {
  constructor({ idService, dossier, idUtilisateur }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    if (!dossier)
      throw Error("Impossible d'instancier l'événement sans dossier");

    if (!idUtilisateur)
      throw Error("Impossible d'instancier l'événement sans ID d'utilisateur");

    this.idService = idService;
    this.dossier = dossier;
    this.importe = true;
    this.idUtilisateur = idUtilisateur;
  }
}

export default EvenementDossierHomologationImporte;

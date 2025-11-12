class EvenementServicesImportes {
  constructor({ idUtilisateur, nbServicesImportes, versionServicesImportes }) {
    if (!nbServicesImportes) {
      throw new Error(
        "Impossible d'instancier l'événement sans nombre de service importés"
      );
    }

    if (!idUtilisateur) {
      throw new Error(
        "Impossible d'instancier l'événement sans identifiant utilisateur"
      );
    }
    this.nbServicesImportes = nbServicesImportes;
    this.idUtilisateur = idUtilisateur;
    this.versionServicesImportes = versionServicesImportes;
  }
}
export default EvenementServicesImportes;

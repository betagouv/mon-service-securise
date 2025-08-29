class EvenementServicesImportes {
  constructor({ idUtilisateur, nbServicesImportes }) {
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
  }
}
export default EvenementServicesImportes;

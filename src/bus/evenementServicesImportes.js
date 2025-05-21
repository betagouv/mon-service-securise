class EvenementServicesImportes {
  constructor({ nbServicesImportes }) {
    if (!nbServicesImportes) {
      throw new Error(
        "Impossible d'instancier l'événement sans nombre de service importés"
      );
    }
    this.nbServicesImportes = nbServicesImportes;
  }
}
module.exports = EvenementServicesImportes;

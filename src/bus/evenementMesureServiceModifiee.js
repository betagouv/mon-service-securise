class EvenementMesureServiceModifiee {
  constructor({ service, utilisateur, ancienneMesure, nouvelleMesure }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
    this.ancienneMesure = ancienneMesure;
    this.nouvelleMesure = nouvelleMesure;
  }
}

module.exports = EvenementMesureServiceModifiee;

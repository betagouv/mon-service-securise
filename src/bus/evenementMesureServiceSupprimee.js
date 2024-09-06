class EvenementMesureServiceSupprimee {
  constructor({ service, utilisateur, idMesure }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
    this.idMesure = idMesure;
  }
}

module.exports = EvenementMesureServiceSupprimee;

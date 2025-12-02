class EvenementServiceV1MigreEnV2 {
  constructor({ service, utilisateur }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
  }
}

export default EvenementServiceV1MigreEnV2;

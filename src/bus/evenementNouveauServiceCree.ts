class EvenementNouveauServiceCree {
  constructor({ service, utilisateur }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
  }
}

module.exports = EvenementNouveauServiceCree;

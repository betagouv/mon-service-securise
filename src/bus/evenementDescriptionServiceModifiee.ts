class EvenementDescriptionServiceModifiee {
  constructor({ service, utilisateur, ancienneDescription }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");
    if (!ancienneDescription)
      throw Error(
        "Impossible d'instancier l'événement sans l'ancienne description"
      );

    this.service = service;
    this.utilisateur = utilisateur;
    this.ancienneDescription = ancienneDescription;
  }
}

module.exports = { EvenementDescriptionServiceModifiee };

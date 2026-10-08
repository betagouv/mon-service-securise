class EvenementMesureServiceModifiee {
  constructor({
    service,
    utilisateur,
    ancienneMesure,
    nouvelleMesure,
    typeMesure,
    enMasse = false,
  }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
    this.ancienneMesure = ancienneMesure;
    this.nouvelleMesure = nouvelleMesure;
    this.typeMesure = typeMesure;
    this.enMasse = enMasse;
  }
}

export default EvenementMesureServiceModifiee;

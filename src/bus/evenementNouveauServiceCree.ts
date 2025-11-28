import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';

export class EvenementNouveauServiceCree {
  public readonly service: Service;
  public readonly utilisateur: Utilisateur;

  constructor({
    service,
    utilisateur,
  }: {
    service: Service;
    utilisateur: Utilisateur;
  }) {
    if (!service)
      throw Error("Impossible d'instancier l'événement sans service");
    if (!utilisateur)
      throw Error("Impossible d'instancier l'événement sans utilisateur");

    this.service = service;
    this.utilisateur = utilisateur;
  }
}

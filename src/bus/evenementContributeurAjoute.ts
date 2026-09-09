import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';

export class EvenementContributeurAjoute {
  public readonly services: Service[];
  public readonly acteur: Utilisateur;
  public readonly destinataire: Utilisateur;

  constructor({
    acteur,
    destinataire,
    services,
  }: {
    acteur: Utilisateur;
    destinataire: Utilisateur;
    services: Service[];
  }) {
    if (!services || !services.length)
      throw Error("Impossible d'instancier l'événement sans services");
    if (!destinataire)
      throw Error("Impossible d'instancier l'événement sans destinataire");
    if (!acteur) throw Error("Impossible d'instancier l'événement sans acteur");

    this.services = services;
    this.acteur = acteur;
    this.destinataire = destinataire;
  }
}

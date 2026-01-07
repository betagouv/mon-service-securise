import { UUID } from 'node:crypto';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

type DonneesEvenementNouvelleConnexionUtilisateur = {
  idUtilisateur: UUID;
  dateDerniereConnexion: string;
  source: SourceAuthentification;
};

class EvenementNouvelleConnexionUtilisateur {
  readonly idUtilisateur: UUID;
  readonly dateDerniereConnexion: string;
  readonly source: SourceAuthentification;

  constructor({
    idUtilisateur,
    dateDerniereConnexion,
    source,
  }: DonneesEvenementNouvelleConnexionUtilisateur) {
    if (!idUtilisateur)
      throw Error("Impossible d'instancier l'événement sans id utilisateur");
    if (!dateDerniereConnexion)
      throw Error(
        "Impossible d'instancier l'événement sans date de dernière connexion"
      );
    if (Number.isNaN(new Date(dateDerniereConnexion).valueOf()))
      throw Error(
        "Impossible d'instancier l'événement sans date de dernière connexion valide"
      );

    this.idUtilisateur = idUtilisateur;
    this.dateDerniereConnexion = dateDerniereConnexion;
    this.source = source;
  }
}

export default EvenementNouvelleConnexionUtilisateur;

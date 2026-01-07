import { UUID } from 'node:crypto';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

type DonneesEvenementNouvelleConnexionUtilisateur = {
  idUtilisateur: UUID;
  dateDerniereConnexion: string;
  source: SourceAuthentification;
  connexionAvecMFA: boolean;
};

class EvenementNouvelleConnexionUtilisateur {
  readonly idUtilisateur: UUID;
  readonly dateDerniereConnexion: string;
  readonly source: SourceAuthentification;
  readonly connexionAvecMFA: boolean;

  constructor({
    idUtilisateur,
    dateDerniereConnexion,
    source,
    connexionAvecMFA,
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
    if (!source) throw Error("Impossible d'instancier l'événement sans source");
    if (connexionAvecMFA === null || connexionAvecMFA === undefined)
      throw Error(
        "Impossible d'instancier l'événement sans connexion avec MFA"
      );

    this.idUtilisateur = idUtilisateur;
    this.dateDerniereConnexion = dateDerniereConnexion;
    this.source = source;
    this.connexionAvecMFA = connexionAvecMFA;
  }
}

export default EvenementNouvelleConnexionUtilisateur;

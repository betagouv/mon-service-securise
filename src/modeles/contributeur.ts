import { Identite } from './identite.js';
import { UUID } from '../typesBasiques.js';

export type DonneesContributeur = {
  id: UUID;
  email: string;
  prenom: string;
  nom: string;
  postes: string[];
  estAdmin: boolean;
  estProprietaire: boolean;
};

class Contributeur {
  public readonly idUtilisateur: UUID;
  private readonly identite: Identite;
  public readonly estAdmin: boolean;
  public readonly estProprietaire: boolean;

  constructor(donnees: DonneesContributeur) {
    const { id, email, prenom, nom, postes, estAdmin, estProprietaire } =
      donnees;
    this.idUtilisateur = id;
    this.identite = new Identite({ email, prenom, nom, postes });
    this.estAdmin = estAdmin;
    this.estProprietaire = estProprietaire;
  }

  prenomNom() {
    return this.identite.prenomNom();
  }

  initiales() {
    return this.identite.initiales();
  }

  posteDetaille() {
    return this.identite.posteDetaille();
  }
}

export { Contributeur };

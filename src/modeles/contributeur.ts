import { Identite } from './identite.js';
import { UUID } from '../typesBasiques.js';

export type DonneesContributeur = {
  id: UUID;
  email: string;
  prenom: string;
  nom: string;
  postes: string[];
};

class Contributeur {
  public readonly idUtilisateur: UUID;
  private readonly identite: Identite;

  constructor(donnees: DonneesContributeur) {
    const { id, email, prenom, nom, postes } = donnees;
    this.idUtilisateur = id;
    this.identite = new Identite({ email, prenom, nom, postes });
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

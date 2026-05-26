import { UUID } from '../../typesBasiques.js';
import { DonneesIdentite, Identite } from '../identite.js';

export class UtilisateurAdministre {
  private readonly identite: Identite;

  constructor(
    readonly id: UUID,
    donneesIdentite: DonneesIdentite,
    readonly estAdmin: boolean
  ) {
    this.identite = new Identite(donneesIdentite);
  }

  email() {
    return this.identite.email;
  }

  prenomNom() {
    return this.identite.prenomNom();
  }

  posteDetaille() {
    return this.identite.posteDetaille();
  }
}

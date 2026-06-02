import { UUID } from '../../typesBasiques.js';
import { DonneesIdentite, Identite } from '../identite.js';
import {
  Autorisation,
  DonneesAutorisation,
} from '../autorisations/autorisation.js';
import * as FabriqueAutorisation from '../autorisations/fabriqueAutorisation.js';

export class UtilisateurAdministre {
  private readonly identite: Identite;
  readonly autorisations: Autorisation[];

  constructor(
    readonly id: UUID,
    donneesIdentite: DonneesIdentite,
    readonly estAdmin: boolean,
    readonly nombreEntites: number,
    readonly donneesAutorisations: DonneesAutorisation[]
  ) {
    this.identite = new Identite(donneesIdentite);
    this.autorisations = donneesAutorisations.map((a) =>
      FabriqueAutorisation.fabrique(a)
    );
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

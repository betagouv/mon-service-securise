import Entite, { DonneesEntite } from './entite.js';
import { UUID } from '../typesBasiques.js';

export type DonneesSuperviseur = {
  idUtilisateur: UUID;
  entitesSupervisees: Array<DonneesEntite>;
};

class Superviseur {
  private readonly idUtilisateur: UUID;
  readonly entitesSupervisees: Entite[];

  constructor(donnees: DonneesSuperviseur) {
    const { idUtilisateur, entitesSupervisees } = donnees;
    this.idUtilisateur = idUtilisateur;
    this.entitesSupervisees = entitesSupervisees.map(
      (donneesEntite) => new Entite(donneesEntite)
    );
  }
}

export default Superviseur;

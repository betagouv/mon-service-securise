import Entite, { DonneesEntite } from './entite.js';
import { UUID } from '../typesBasiques.js';

export type DonneesSuperviseur = {
  idUtilisateur: UUID;
  entitesSupervisees: Array<DonneesEntite>;
};

class Superviseur {
  readonly entitesSupervisees: Entite[];

  private constructor(
    private readonly idUtilisateur: UUID,
    entitesSupervisees: Entite[]
  ) {
    this.entitesSupervisees = entitesSupervisees;
  }

  static nouveau(idUtilisateur: UUID) {
    return new Superviseur(idUtilisateur, []);
  }

  static hydrate(donnees: DonneesSuperviseur) {
    return new Superviseur(
      donnees.idUtilisateur,
      donnees.entitesSupervisees.map((d) => new Entite(d))
    );
  }

  donnees(): DonneesSuperviseur {
    return {
      idUtilisateur: this.idUtilisateur,
      entitesSupervisees: this.entitesSupervisees.map(
        (e) => e.toJSON() as DonneesEntite
      ),
    };
  }
}

export default Superviseur;

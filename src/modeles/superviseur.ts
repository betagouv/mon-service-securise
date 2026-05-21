import Entite, { DonneesEntite } from './entite.js';
import { UUID } from '../typesBasiques.js';

export type DonneesSuperviseur = {
  idUtilisateur: UUID;
  entitesSupervisees: Array<DonneesEntite>;
};

class Superviseur {
  private constructor(
    private readonly idUtilisateur: UUID,
    private readonly entitesSupervisees: Entite[]
  ) {}

  static nouveau(idUtilisateur: UUID) {
    return new Superviseur(idUtilisateur, []);
  }

  static hydrate(donnees: DonneesSuperviseur) {
    return new Superviseur(
      donnees.idUtilisateur,
      donnees.entitesSupervisees.map((d) => new Entite(d))
    );
  }

  supervise(entite: Entite) {
    const dejaSupervisee = this.entitesSupervisees.find(
      (e) => e.siret === entite.siret
    );
    if (dejaSupervisee) return;

    this.entitesSupervisees.push(entite);
  }

  estSuperviseurDe(siret: string) {
    return this.entitesSupervisees.map((e) => e.siret).includes(siret);
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

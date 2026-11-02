import Superviseur, {
  DonneesSuperviseur,
} from '../../src/modeles/superviseur.js';
import { DonneesEntite } from '../../src/modeles/entite.js';
import { UUID } from '../../src/typesBasiques.js';
import { unUUID } from './UUID.js';

class ConstructeurSuperviseur {
  private readonly donnees: DonneesSuperviseur;

  constructor(idUtilisateur: UUID) {
    this.donnees = { idUtilisateur, entitesSupervisees: [] };
  }

  quiSupervise(...entites: DonneesEntite[]) {
    this.donnees.entitesSupervisees.push(...entites);
    return this;
  }

  quiSuperviseLesSirets(...sirets: string[]) {
    return this.quiSupervise(...sirets.map((siret) => ({ siret })));
  }

  construis() {
    return Superviseur.hydrate(this.donnees);
  }
}

export const unSuperviseur = (idUtilisateur: UUID = unUUID('S')) =>
  new ConstructeurSuperviseur(idUtilisateur);

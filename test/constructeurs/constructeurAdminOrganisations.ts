import {
  AdminOrganisations,
  DonneesAdminOrganisations,
} from '../../src/modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesEntite } from '../../src/modeles/entite.js';
import { UUID } from '../../src/typesBasiques.js';
import { unUUID } from './UUID.js';

class ConstructeurAdminOrganisations {
  private readonly donnees: DonneesAdminOrganisations;

  constructor(idUtilisateur: UUID) {
    this.donnees = { idUtilisateur, entitesAdministrees: [] };
  }

  quiAdministre(...entites: DonneesEntite[]) {
    this.donnees.entitesAdministrees.push(...entites);
    return this;
  }

  quiAdministreLesSirets(...sirets: string[]) {
    return this.quiAdministre(...sirets.map((siret) => ({ siret })));
  }

  construis() {
    return AdminOrganisations.hydrate(this.donnees);
  }
}

export const unAdminOrganisations = (idUtilisateur: UUID = unUUID('A')) =>
  new ConstructeurAdminOrganisations(idUtilisateur);

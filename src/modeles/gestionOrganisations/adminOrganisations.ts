import { UUID } from '../../typesBasiques.js';
import Entite, { DonneesEntite } from '../entite.js';

type DonneesAdminOrganisations = {
  entitesAdministrees: DonneesEntite[];
  idUtilisateur: UUID;
};

export class AdminOrganisations {
  private entitesAdministrees: Entite[];

  constructor(private idUtilisateur: UUID) {
    this.entitesAdministrees = [];
  }

  static nouveau(idUtilisateur: UUID) {
    return new AdminOrganisations(idUtilisateur);
  }

  donnees(): DonneesAdminOrganisations {
    return {
      idUtilisateur: this.idUtilisateur,
      entitesAdministrees: this.entitesAdministrees.map(
        (e) => e.toJSON() as DonneesEntite
      ),
    };
  }

  administreCetteEntite(entite: Entite) {
    this.entitesAdministrees.push(entite);
  }
}

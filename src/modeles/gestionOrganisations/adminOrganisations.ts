import { UUID } from '../../typesBasiques.js';
import Entite, { DonneesEntite } from '../entite.js';

export type DonneesAdminOrganisations = {
  entitesAdministrees: DonneesEntite[];
  idUtilisateur: UUID;
};

export class AdminOrganisations {
  constructor(
    private idUtilisateur: UUID,
    private entitesAdministrees: Entite[]
  ) {}

  static nouveau(idUtilisateur: UUID) {
    return new AdminOrganisations(idUtilisateur, []);
  }

  static hydrate(donnees: DonneesAdminOrganisations) {
    return new AdminOrganisations(
      donnees.idUtilisateur,
      donnees.entitesAdministrees.map((e) => new Entite(e))
    );
  }

  donnees(): DonneesAdminOrganisations {
    return {
      idUtilisateur: this.idUtilisateur,
      entitesAdministrees: this.entitesAdministrees.map(
        (e) => e.toJSON() as DonneesEntite
      ),
    };
  }

  administre(entite: Entite) {
    const dejaAdministree = this.entitesAdministrees.find(
      (e) => e.siret === entite.siret
    );
    if (dejaAdministree) return;

    this.entitesAdministrees.push(entite);
  }

  cesseDAdministrer(entite: Entite) {
    this.entitesAdministrees = this.entitesAdministrees.filter(
      (e) => e.siret !== entite.siret
    );
  }
}

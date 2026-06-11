import { UUID } from '../../typesBasiques.js';
import Entite, { DonneesEntite } from '../entite.js';

export type DonneesAdminOrganisations = {
  entitesAdministrees: DonneesEntite[];
  idUtilisateur: UUID;
};

export class AdminOrganisations {
  private constructor(
    private readonly idUtilisateur: UUID,
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

  estAdminDe(siret: string) {
    return this.entitesAdministrees.some((e) => e.siret === siret);
  }

  estAdminDuPerimetre(sirets: string[]) {
    return new Set(sirets).isSubsetOf(
      new Set(this.entitesAdministrees.map((e) => e.siret))
    );
  }
}

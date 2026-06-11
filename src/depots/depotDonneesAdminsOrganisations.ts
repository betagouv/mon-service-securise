import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { UUID } from '../typesBasiques.js';

import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';

export class DepotDonneesAdminsOrganisations {
  private readonly persistance: PersistanceTS;

  constructor({ persistance }: { persistance: PersistanceTS }) {
    this.persistance = persistance;
  }

  async lisAdminOrganisations(
    idUtilisateur: UUID
  ): Promise<AdminOrganisations | undefined> {
    const donnees = await this.persistance.lisAdminOrganisations(idUtilisateur);

    return donnees ? AdminOrganisations.hydrate(donnees) : undefined;
  }

  async lisAdminsPour(siret: string): Promise<Array<AdminOrganisations>> {
    const donnees = await this.persistance.lisAdminsOrganisation(siret);

    return donnees.map((d) => AdminOrganisations.hydrate(d));
  }

  async sauvegardeAdminOrganisations(admin: AdminOrganisations) {
    await this.persistance.sauvegardeAdminOrganisations(admin.donnees());
  }

  async estAdmin(idUtilisateur: UUID): Promise<boolean> {
    const admin = await this.lisAdminOrganisations(idUtilisateur);

    return admin !== undefined;
  }
}

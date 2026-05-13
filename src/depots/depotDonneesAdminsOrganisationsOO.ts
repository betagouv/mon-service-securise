import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { UUID } from '../typesBasiques.js';

import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';

export class DepotDonneesAdminsOrganisationsOO {
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
}

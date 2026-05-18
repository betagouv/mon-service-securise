import { UUID } from '../typesBasiques.js';
import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { PersistanceTS } from './persistanceTS.interface.js';

type DonneesPersistanceMemoire = {
  adminsOrganisations: DonneesAdminOrganisations[];
};

export class AdaptateurPersistanceMemoireTS implements PersistanceTS {
  private readonly donnees: DonneesPersistanceMemoire = {
    adminsOrganisations: [],
  };

  constructor(donnees?: DonneesPersistanceMemoire) {
    if (donnees) this.donnees = donnees;
  }

  async lisAdminOrganisations(
    idUtilisateur: UUID
  ): Promise<DonneesAdminOrganisations | undefined> {
    return this.donnees.adminsOrganisations.find(
      (a) => a.idUtilisateur === idUtilisateur
    );
  }

  async lisAdminsOrganisation(
    siret: string
  ): Promise<Array<DonneesAdminOrganisations>> {
    return this.donnees.adminsOrganisations.filter((a) =>
      a.entitesAdministrees.map((e) => e.siret).includes(siret)
    );
  }
}

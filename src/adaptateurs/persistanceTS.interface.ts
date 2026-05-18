import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { UUID } from '../typesBasiques.js';

export interface PersistanceTS {
  lisAdminOrganisations: (
    idUtilisateur: UUID
  ) => Promise<DonneesAdminOrganisations | undefined>;
  lisAdminsOrganisation: (
    siret: string
  ) => Promise<Array<DonneesAdminOrganisations>>;
  sauvegardeAdminOrganisations: (
    donnees: DonneesAdminOrganisations
  ) => Promise<void>;
}

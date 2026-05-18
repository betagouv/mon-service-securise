import { UUID } from '../typesBasiques.js';

export type DepotDonneesAdminsOrganisations = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  ajouteSiretAAdmin: (idUtilisateur: UUID, siret: string) => Promise<void>;
};

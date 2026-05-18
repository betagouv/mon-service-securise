import { UUID } from '../typesBasiques.js';

export type DepotDonneesAdminsOrganisations = {
  ajouteSiretAAdmin: (idUtilisateur: UUID, siret: string) => Promise<void>;
};

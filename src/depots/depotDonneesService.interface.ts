import { UUID } from '../typesBasiques.js';

export interface DepotDonneesService {
  nouveauService: (
    idUtilisateur: UUID,
    donneesService: unknown
  ) => Promise<UUID>;
}

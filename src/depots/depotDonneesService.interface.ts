import { UUID } from '../typesBasiques.js';
import { DonneesDescriptionServiceV2 } from '../modeles/descriptionServiceV2.js';

export type DonneesCreationService = {
  versionService: string;
  descriptionService: DonneesDescriptionServiceV2;
};

export interface DepotDonneesService {
  nouveauService: (
    idUtilisateur: UUID,
    donneesService: DonneesCreationService
  ) => Promise<UUID>;
}

import { UUID } from '../typesBasiques.js';
import { DonneesDescriptionServiceV2 } from '../modeles/descriptionServiceV2.js';
import Service from '../modeles/service.js';

export type DonneesCreationService = {
  versionService: string;
  descriptionService: DonneesDescriptionServiceV2;
};

export interface DepotDonneesService {
  nouveauService: (
    idUtilisateur: UUID,
    donneesService: DonneesCreationService
  ) => Promise<UUID>;
  service: (idService: UUID) => Promise<Service | undefined>;
}

import { UUID } from '../typesBasiques.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../modeles/descriptionServiceV2.js';
import Service from '../modeles/service.js';
import { DonneesMesureGenerale } from '../modeles/mesureGenerale.type.js';
import type { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

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
  migreServiceVersV2: (
    idUtilisateur: UUID,
    idService: UUID,
    descriptionV2: DescriptionServiceV2,
    donneesMesuresV2: DonneesMesureGenerale<IdMesureV2>[]
  ) => Promise<void>;
}

import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';

export type DonneesBrouillonService = {
  nomService: string;
};

export class BrouillonService {
  readonly nomService: string;

  constructor(
    readonly id: UUID,
    donnees: DonneesBrouillonService
  ) {
    this.nomService = donnees.nomService;
  }

  enDonneesDescriptionServiceV2() {
    return { nomService: this.nomService, versionService: VersionService.v2 };
  }
}

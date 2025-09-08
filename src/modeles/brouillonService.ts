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

  enDonneesCreationServiceV2() {
    const siretFacticePourLeMoment = '11111111111111';
    return {
      versionService: VersionService.v2,
      descriptionService: {
        nomService: this.nomService,
        organisationResponsable: { siret: siretFacticePourLeMoment },
      },
    };
  }
}

import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';

export type DonneesBrouillonService = {
  nomService: string;
  siret?: string;
};

export class BrouillonService {
  readonly nomService: string;
  protected siret?: string;

  constructor(
    readonly id: UUID,
    donnees: DonneesBrouillonService
  ) {
    this.nomService = donnees.nomService;
    this.siret = donnees.siret;
  }

  metsAJourSiret(nouveauSiret: string) {
    this.siret = nouveauSiret;
  }

  enDonneesCreationServiceV2() {
    return {
      versionService: VersionService.v2,
      descriptionService: {
        nomService: this.nomService,
        organisationResponsable: { siret: this.siret },
      },
    };
  }
}

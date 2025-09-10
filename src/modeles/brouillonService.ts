import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';

export type DonneesBrouillonService = {
  nomService: string;
  siret?: string;
  statutDeploiement?: string;
};

export type ProprietesBrouillonService = keyof DonneesBrouillonService;

export class BrouillonService {
  protected nomService: string;
  protected siret?: string;
  protected statutDeploiement?: string;

  constructor(
    readonly id: UUID,
    donnees: DonneesBrouillonService
  ) {
    this.nomService = donnees.nomService;
    this.siret = donnees.siret;
    this.statutDeploiement = donnees.statutDeploiement;
  }

  metsAJourPropriete<T extends ProprietesBrouillonService>(
    nomPropriete: T,
    valeur: Required<DonneesBrouillonService>[T]
  ) {
    this[nomPropriete as ProprietesBrouillonService] = valeur;
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

  donneesAPersister() {
    return {
      nomService: this.nomService,
      ...(this.siret && { siret: this.siret }),
      ...(this.statutDeploiement && {
        statutDeploiement: this.statutDeploiement,
      }),
    };
  }
}

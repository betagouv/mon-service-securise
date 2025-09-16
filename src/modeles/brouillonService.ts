import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import {
  DonneesDescriptionServiceV2,
  StatutDeploiement,
} from './descriptionServiceV2.js';

export type DonneesBrouillonService = {
  nomService: string;
  siret?: string;
  statutDeploiement?: string;
  presentation?: string;
};

export type ProprietesBrouillonService = keyof DonneesBrouillonService;

export class BrouillonService {
  private donnees: DonneesBrouillonService;

  constructor(
    readonly id: UUID,
    donnees: DonneesBrouillonService
  ) {
    this.donnees = donnees;
  }

  metsAJourPropriete<T extends ProprietesBrouillonService>(
    nomPropriete: T,
    valeur: Required<DonneesBrouillonService>[T]
  ) {
    this.donnees[nomPropriete] = valeur;
  }

  enDonneesCreationServiceV2(): {
    versionService: VersionService;
    descriptionService: DonneesDescriptionServiceV2;
  } {
    return {
      versionService: VersionService.v2,
      descriptionService: {
        nomService: this.donnees.nomService,
        organisationResponsable: { siret: this.donnees.siret! },
        statutDeploiement: this.donnees.statutDeploiement as StatutDeploiement,
        presentation: this.donnees.presentation!,
        niveauDeSecurite: '', // TODO : Étape 5
        categorieDonneesTraitees: 'donneesSensibles', // TODO : Étape 3 > Question 4
        volumetrieDonneesTraitees: 'faible', // TODO : Étape 3 > Question 5
      },
    };
  }

  toJSON() {
    return { id: this.id, ...this.donneesAPersister() };
  }

  donneesAPersister(): DonneesBrouillonService {
    return {
      nomService: this.donnees.nomService,
      ...(this.donnees.siret && { siret: this.donnees.siret }),
      ...(this.donnees.statutDeploiement && {
        statutDeploiement: this.donnees.statutDeploiement,
      }),
      ...(this.donnees.presentation && {
        presentation: this.donnees.presentation,
      }),
    };
  }
}

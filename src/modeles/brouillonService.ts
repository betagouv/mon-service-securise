import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import {
  DonneesDescriptionServiceV2,
  StatutDeploiement,
} from './descriptionServiceV2.js';
import donneesReferentiel from '../../donneesReferentiel.js';
import { questionsV2 } from '../../donneesReferentielMesuresV2.js';

export type DonneesBrouillonService = {
  nomService: string;
  siret?: string;
  statutDeploiement?: keyof typeof donneesReferentiel.statutsDeploiement;
  presentation?: string;
  pointsAcces?: string[];
  typeService?: Array<keyof typeof questionsV2.typeDeService>;
  specificitesProjet?: Array<keyof typeof questionsV2.specificiteProjet>;
  typeHebergement?: keyof typeof questionsV2.typeHebergement;
  activitesExternalisees?: Array<keyof typeof questionsV2.activiteExternalisee>;
  ouvertureSysteme?: keyof typeof questionsV2.ouvertureSysteme;
};

export type ProprietesBrouillonService = keyof DonneesBrouillonService;

export class BrouillonService {
  private readonly donnees: DonneesBrouillonService;

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
        pointsAcces:
          this.donnees.pointsAcces?.map((p) => ({ description: p })) || [],
        typeService: this.donnees.typeService!,
        specificitesProjet: this.donnees.specificitesProjet || [],
        typeHebergement: this.donnees.typeHebergement!,
        activitesExternalisees: this.donnees.activitesExternalisees || [],
        ouvertureSysteme: this.donnees.ouvertureSysteme!,
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
      ...(this.donnees.pointsAcces && {
        pointsAcces: this.donnees.pointsAcces,
      }),
      ...(this.donnees.typeService && {
        typeService: this.donnees.typeService,
      }),
      ...(this.donnees.specificitesProjet && {
        specificitesProjet: this.donnees.specificitesProjet,
      }),
      ...(this.donnees.typeHebergement && {
        typeHebergement: this.donnees.typeHebergement,
      }),
      ...(this.donnees.activitesExternalisees && {
        activitesExternalisees: this.donnees.activitesExternalisees,
      }),
      ...(this.donnees.ouvertureSysteme && {
        ouvertureSysteme: this.donnees.ouvertureSysteme,
      }),
    };
  }
}

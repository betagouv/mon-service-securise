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
  audienceCible?: keyof typeof questionsV2.audienceCible;
  dureeDysfonctionnementAcceptable?: keyof typeof questionsV2.dureeDysfonctionnementAcceptable;
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
        audienceCible: this.donnees.audienceCible!,
        dureeDysfonctionnementAcceptable:
          this.donnees.dureeDysfonctionnementAcceptable!,
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
    const siPresente = (champ: keyof DonneesBrouillonService) =>
      this.donnees[champ] && { [champ]: this.donnees[champ] };

    return {
      nomService: this.donnees.nomService,
      ...siPresente('siret'),
      ...siPresente('statutDeploiement'),
      ...siPresente('presentation'),
      ...siPresente('pointsAcces'),
      ...siPresente('typeService'),
      ...siPresente('specificitesProjet'),
      ...siPresente('typeHebergement'),
      ...siPresente('activitesExternalisees'),
      ...siPresente('ouvertureSysteme'),
      ...siPresente('audienceCible'),
      ...siPresente('dureeDysfonctionnementAcceptable'),
    };
  }
}

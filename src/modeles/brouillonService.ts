import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import { DonneesDescriptionServiceV2 } from './descriptionServiceV2.js';
import {
  ActiviteExternalisee,
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  NiveauSecurite,
  OuvertureSysteme,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';

export type DonneesBrouillonService = {
  nomService: string;
  siret?: string;
  statutDeploiement?: StatutDeploiement;
  presentation?: string;
  pointsAcces?: string[];
  typeService?: Array<TypeDeService>;
  specificitesProjet?: Array<SpecificiteProjet>;
  typeHebergement?: TypeHebergement;
  activitesExternalisees?: Array<ActiviteExternalisee>;
  ouvertureSysteme?: OuvertureSysteme;
  audienceCible?: AudienceCible;
  dureeDysfonctionnementAcceptable?: DureeDysfonctionnementAcceptable;
  categoriesDonneesTraitees?: Array<CategorieDonneesTraitees>;
  categoriesDonneesTraiteesSupplementaires?: Array<string>;
  volumetrieDonneesTraitees?: VolumetrieDonneesTraitees;
  localisationDonneesTraitees?: LocalisationDonneesTraitees;
  niveauSecurite?: NiveauSecurite;
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
    valeur: DonneesBrouillonService[T]
  ) {
    this.donnees[nomPropriete] = valeur;
  }

  enDonneesCreationServiceV2(): {
    versionService: VersionService;
    descriptionService: DonneesDescriptionServiceV2;
  } {
    const sansDoublonsOuTableauVide = <T>(tableau: Array<T> | undefined) =>
      tableau ? [...new Set(tableau)] : [];
    return {
      versionService: VersionService.v2,
      descriptionService: {
        nomService: this.donnees.nomService,
        organisationResponsable: { siret: this.donnees.siret! },
        statutDeploiement: this.donnees.statutDeploiement as StatutDeploiement,
        presentation: this.donnees.presentation!,
        pointsAcces:
          this.donnees.pointsAcces?.map((p) => ({ description: p })) || [],
        typeService: sansDoublonsOuTableauVide(this.donnees.typeService),
        specificitesProjet: sansDoublonsOuTableauVide(
          this.donnees.specificitesProjet
        ),
        typeHebergement: this.donnees.typeHebergement!,
        activitesExternalisees: sansDoublonsOuTableauVide(
          this.donnees.activitesExternalisees
        ),
        ouvertureSysteme: this.donnees.ouvertureSysteme!,
        audienceCible: this.donnees.audienceCible!,
        dureeDysfonctionnementAcceptable:
          this.donnees.dureeDysfonctionnementAcceptable!,
        categoriesDonneesTraitees: sansDoublonsOuTableauVide(
          this.donnees.categoriesDonneesTraitees
        ),
        categoriesDonneesTraiteesSupplementaires: sansDoublonsOuTableauVide(
          this.donnees.categoriesDonneesTraiteesSupplementaires
        ),
        volumetrieDonneesTraitees: this.donnees.volumetrieDonneesTraitees!,
        localisationDonneesTraitees: this.donnees.localisationDonneesTraitees!,
        niveauSecurite: this.donnees.niveauSecurite!,
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
      ...siPresente('categoriesDonneesTraitees'),
      ...siPresente('categoriesDonneesTraiteesSupplementaires'),
      ...siPresente('volumetrieDonneesTraitees'),
      ...siPresente('localisationDonneesTraitees'),
      ...siPresente('niveauSecurite'),
    };
  }
}

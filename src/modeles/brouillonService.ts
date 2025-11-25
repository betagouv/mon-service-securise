import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from './descriptionServiceV2.js';
import donneesReferentiel from '../../donneesReferentiel.js';
import {
  LocalisationDonneesTraitees,
  NiveauSecurite,
  questionsV2,
  StatutDeploiement,
} from '../../donneesReferentielMesuresV2.js';
import { PourCalculNiveauSecurite } from '../moteurRegles/v2/niveauSecurite.js';
import { ReferentielV2 } from '../referentiel.interface.js';

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
  categoriesDonneesTraitees?: Array<
    keyof typeof questionsV2.categorieDonneesTraitees
  >;
  categoriesDonneesTraiteesSupplementaires?: string[];
  volumetrieDonneesTraitees?: keyof typeof questionsV2.volumetrieDonneesTraitees;
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

  pourCalculNiveauDeSecurite(): PourCalculNiveauSecurite {
    return {
      audienceCible: this.donnees.audienceCible!,
      autresDonneesTraitees:
        this.donnees.categoriesDonneesTraiteesSupplementaires || [],
      categories: this.donnees.categoriesDonneesTraitees || [],
      disponibilite: this.donnees.dureeDysfonctionnementAcceptable!,
      ouvertureSysteme: this.donnees.ouvertureSysteme!,
      volumetrie: this.donnees.volumetrieDonneesTraitees!,
    };
  }

  enDescriptionV2(referentiel: ReferentielV2) {
    return new DescriptionServiceV2(
      this.enDonneesCreationServiceV2().descriptionService,
      referentiel
    );
  }

  enDonneesCreationServiceV2(): {
    versionService: VersionService;
    descriptionService: DonneesDescriptionServiceV2;
  } {
    const dedoublonne = <T>(tableau: Array<T> | undefined) =>
      tableau ? [...new Set(tableau)] : [];

    return {
      versionService: VersionService.v2,
      descriptionService: {
        activitesExternalisees: dedoublonne(
          this.donnees.activitesExternalisees
        ),
        audienceCible: this.donnees.audienceCible!,
        categoriesDonneesTraitees: dedoublonne(
          this.donnees.categoriesDonneesTraitees
        ),
        categoriesDonneesTraiteesSupplementaires: dedoublonne(
          this.donnees.categoriesDonneesTraiteesSupplementaires
        ),
        dureeDysfonctionnementAcceptable:
          this.donnees.dureeDysfonctionnementAcceptable!,
        localisationDonneesTraitees: this.donnees.localisationDonneesTraitees!,
        niveauSecurite: this.donnees.niveauSecurite!,
        nomService: this.donnees.nomService,
        organisationResponsable: { siret: this.donnees.siret! },
        ouvertureSysteme: this.donnees.ouvertureSysteme!,
        pointsAcces: dedoublonne(this.donnees.pointsAcces).map((p) => ({
          description: p,
        })),
        presentation: this.donnees.presentation!,
        specificitesProjet: dedoublonne(this.donnees.specificitesProjet),
        statutDeploiement: this.donnees.statutDeploiement as StatutDeploiement,
        typeHebergement: this.donnees.typeHebergement!,
        typeService: dedoublonne(this.donnees.typeService),
        volumetrieDonneesTraitees: this.donnees.volumetrieDonneesTraitees!,
      },
    };
  }

  toJSON() {
    return { id: this.id, ...this.donneesAPersister() };
  }

  donneesAPersister(): DonneesBrouillonService {
    const siPresente = (champ: keyof DonneesBrouillonService) =>
      this.donnees[champ] && {
        [champ]: Array.isArray(this.donnees[champ])
          ? [...new Set(this.donnees[champ])]
          : this.donnees[champ],
      };

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

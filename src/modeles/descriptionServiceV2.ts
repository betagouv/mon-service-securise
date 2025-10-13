import Entite from './entite.js';
import InformationsService from './informationsService.js';
import {
  ActiviteExternalisee,
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  NiveauSecurite,
  OuvertureSysteme,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';
import PointsAcces from './pointsAcces.js';
import {
  criticiteDeDisponibilite,
  criticiteMaxDeDonneesTraitees,
  criticiteOuverture,
  niveauSecuriteRequis,
} from '../moteurRegles/v2/niveauSecurite.js';
import {
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurDonneesObligatoiresManquantes,
} from '../erreurs.js';
import { ProjectionDescriptionPourMoteur } from '../moteurRegles/v2/moteurReglesV2.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};

export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
  niveauDeSecurite: NiveauSecurite;
  statutDeploiement: StatutDeploiement;
  presentation: string;
  pointsAcces: { description: string }[];
  typeService: TypeDeService[];
  specificitesProjet: SpecificiteProjet[];
  typeHebergement: TypeHebergement;
  activitesExternalisees: ActiviteExternalisee[];
  ouvertureSysteme: OuvertureSysteme;
  audienceCible: AudienceCible;
  dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable;
  categoriesDonneesTraitees: CategorieDonneesTraitees[];
  categoriesDonneesTraiteesSupplementaires: string[];
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  localisationsDonneesTraitees: LocalisationDonneesTraitees[];
};

export class DescriptionServiceV2 {
  readonly nomService: string;
  readonly organisationResponsable: Entite;
  readonly niveauDeSecurite: NiveauSecurite;
  readonly statutDeploiement: StatutDeploiement;
  readonly volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  private readonly presentation: string;
  private readonly pointsAcces: PointsAcces;
  private readonly typeService: TypeDeService[];
  private readonly specificitesProjet: SpecificiteProjet[];
  private readonly typeHebergement: TypeHebergement;
  private readonly activitesExternalisees: ActiviteExternalisee[];
  private readonly ouvertureSysteme: OuvertureSysteme;
  private readonly audienceCible: AudienceCible;
  private readonly dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable;
  private readonly categoriesDonneesTraitees: CategorieDonneesTraitees[];
  private readonly categoriesDonneesTraiteesSupplementaires: string[];
  private readonly localisationsDonneesTraitees: LocalisationDonneesTraitees[];

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    this.statutDeploiement = donnees.statutDeploiement;
    this.niveauDeSecurite = donnees.niveauDeSecurite;
    this.volumetrieDonneesTraitees = donnees.volumetrieDonneesTraitees;
    this.presentation = donnees.presentation;
    this.pointsAcces = new PointsAcces({
      pointsAcces: donnees.pointsAcces || [],
    });
    this.typeService = donnees.typeService;
    this.specificitesProjet = donnees.specificitesProjet;
    this.typeHebergement = donnees.typeHebergement;
    this.activitesExternalisees = donnees.activitesExternalisees;
    this.ouvertureSysteme = donnees.ouvertureSysteme;
    this.audienceCible = donnees.audienceCible;
    this.dureeDysfonctionnementAcceptable =
      donnees.dureeDysfonctionnementAcceptable;
    this.categoriesDonneesTraitees = donnees.categoriesDonneesTraitees;
    this.categoriesDonneesTraiteesSupplementaires =
      donnees.categoriesDonneesTraiteesSupplementaires;
    this.localisationsDonneesTraitees = donnees.localisationsDonneesTraitees;
  }

  static donneesObligatoiresRenseignees(
    donnees: DonneesDescriptionServiceV2
  ): boolean {
    return (
      !!donnees.nomService &&
      !!donnees.niveauDeSecurite &&
      !!donnees.organisationResponsable &&
      !!donnees.organisationResponsable.siret &&
      !!donnees.statutDeploiement &&
      !!donnees.presentation &&
      !!donnees.typeService &&
      donnees.typeService.length > 0 &&
      !!donnees.typeHebergement &&
      !!donnees.ouvertureSysteme &&
      !!donnees.audienceCible &&
      !!donnees.dureeDysfonctionnementAcceptable &&
      !!donnees.volumetrieDonneesTraitees &&
      !!donnees.localisationsDonneesTraitees &&
      donnees.localisationsDonneesTraitees?.length > 0
    );
  }

  static niveauSecuriteChoisiSuffisant(
    donnees: DonneesDescriptionServiceV2
  ): boolean {
    const niveauSecuriteMinimal = this.niveauSecuriteMinimalRequis(donnees);
    return (
      questionsV2.niveauSecurite[donnees.niveauDeSecurite].position >=
      questionsV2.niveauSecurite[niveauSecuriteMinimal].position
    );
  }

  static valideDonneesCreation(donnees: DonneesDescriptionServiceV2) {
    if (!this.donneesObligatoiresRenseignees(donnees))
      throw new ErreurDonneesObligatoiresManquantes();
    if (!this.niveauSecuriteChoisiSuffisant(donnees))
      throw new ErreurDonneesNiveauSecuriteInsuffisant();
  }

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return InformationsService.COMPLETES;
  }

  donneesSerialisees(): DonneesDescriptionServiceV2 {
    return {
      niveauDeSecurite: this.niveauDeSecurite,
      organisationResponsable:
        this.organisationResponsable.toJSON() as DonneesEntite,
      statutDeploiement: this.statutDeploiement,
      volumetrieDonneesTraitees: this.volumetrieDonneesTraitees,
      nomService: this.nomService,
      presentation: this.presentation,
      pointsAcces: this.pointsAcces.donneesSerialisees(),
      typeService: this.typeService,
      specificitesProjet: this.specificitesProjet,
      typeHebergement: this.typeHebergement,
      activitesExternalisees: this.activitesExternalisees,
      ouvertureSysteme: this.ouvertureSysteme,
      audienceCible: this.audienceCible,
      dureeDysfonctionnementAcceptable: this.dureeDysfonctionnementAcceptable,
      categoriesDonneesTraitees: this.categoriesDonneesTraitees,
      categoriesDonneesTraiteesSupplementaires:
        this.categoriesDonneesTraiteesSupplementaires,
      localisationsDonneesTraitees: this.localisationsDonneesTraitees,
    };
  }

  static niveauSecuriteMinimalRequis(
    donnees: DonneesDescriptionServiceV2
  ): NiveauSecurite {
    return niveauSecuriteRequis(
      donnees.volumetrieDonneesTraitees,
      donnees.categoriesDonneesTraitees,
      donnees.categoriesDonneesTraiteesSupplementaires,
      donnees.dureeDysfonctionnementAcceptable,
      donnees.audienceCible,
      donnees.ouvertureSysteme
    );
  }

  projectionPourMoteurV2(): ProjectionDescriptionPourMoteur {
    return {
      criticiteDonneesTraitees:
        this.categoriesDonneesTraitees.length > 0
          ? criticiteMaxDeDonneesTraitees(this.categoriesDonneesTraitees)
          : 1,
      criticiteDisponibilite: criticiteDeDisponibilite(
        this.dureeDysfonctionnementAcceptable
      ),
      donneesHorsUE: this.localisationsDonneesTraitees.includes('horsUE'),
      criticiteOuverture: criticiteOuverture(this.ouvertureSysteme),
      specificitesProjet: this.specificitesProjet,
      typeService: this.typeService,
      typeHebergement: this.typeHebergement,
      activitesExternalisees:
        this.activitesExternalisees.length === 1
          ? this.activitesExternalisees[0]
          : 'LesDeux',
    };
  }
}

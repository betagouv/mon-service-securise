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
  PourCalculNiveauSecurite,
} from '../moteurRegles/v2/niveauSecurite.js';
import {
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurDonneesObligatoiresManquantes,
} from '../erreurs.js';
import { ProjectionDescriptionPourMoteur } from '../moteurRegles/v2/moteurReglesV2.js';
import { Referentiel } from '../referentiel.interface.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};

export type DonneesDescriptionServiceV2 = {
  activitesExternalisees: ActiviteExternalisee[];
  audienceCible: AudienceCible;
  categoriesDonneesTraitees: CategorieDonneesTraitees[];
  categoriesDonneesTraiteesSupplementaires: string[];
  dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable;
  localisationDonneesTraitees: LocalisationDonneesTraitees;
  niveauSecurite: NiveauSecurite;
  nomService: string;
  organisationResponsable: DonneesEntite;
  ouvertureSysteme: OuvertureSysteme;
  pointsAcces: { description: string }[];
  presentation?: string;
  specificitesProjet: SpecificiteProjet[];
  statutDeploiement: StatutDeploiement;
  typeHebergement: TypeHebergement;
  typeService: TypeDeService[];
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
};

export class DescriptionServiceV2 {
  readonly activitesExternalisees: ActiviteExternalisee[];
  readonly audienceCible: AudienceCible;
  readonly nomService: string;
  readonly organisationResponsable: Entite;
  readonly ouvertureSysteme: OuvertureSysteme;
  readonly niveauSecurite: NiveauSecurite;
  readonly statutDeploiement: StatutDeploiement;
  readonly volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  readonly specificitesProjet: SpecificiteProjet[];
  readonly categoriesDonneesTraitees: CategorieDonneesTraitees[];
  readonly categoriesDonneesTraiteesSupplementaires: string[];
  readonly dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable;
  readonly pointsAcces: PointsAcces;
  readonly typeService: TypeDeService[];
  readonly typeHebergement: TypeHebergement;
  private readonly presentation: string | undefined;
  private readonly localisationDonneesTraitees: LocalisationDonneesTraitees;
  private readonly referentiel: Referentiel;

  constructor(donnees: DonneesDescriptionServiceV2, referentiel: Referentiel) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    this.statutDeploiement = donnees.statutDeploiement;
    this.niveauSecurite = donnees.niveauSecurite;
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
    this.localisationDonneesTraitees = donnees.localisationDonneesTraitees;
    this.referentiel = referentiel;
  }

  static donneesObligatoiresRenseignees(
    donnees: DonneesDescriptionServiceV2
  ): boolean {
    return (
      !!donnees.nomService &&
      !!donnees.niveauSecurite &&
      !!donnees.organisationResponsable &&
      !!donnees.organisationResponsable.siret &&
      !!donnees.statutDeploiement &&
      !!donnees.typeService &&
      donnees.typeService.length > 0 &&
      !!donnees.typeHebergement &&
      !!donnees.ouvertureSysteme &&
      !!donnees.audienceCible &&
      !!donnees.dureeDysfonctionnementAcceptable &&
      !!donnees.volumetrieDonneesTraitees &&
      !!donnees.localisationDonneesTraitees
    );
  }

  static niveauSecuriteChoisiSuffisant(
    donnees: PourCalculNiveauSecurite,
    niveauChoisi: NiveauSecurite
  ): boolean {
    const niveauSecuriteMinimal = this.niveauSecuriteMinimalRequis(donnees);
    return (
      questionsV2.niveauSecurite[niveauChoisi].position >=
      questionsV2.niveauSecurite[niveauSecuriteMinimal].position
    );
  }

  static valideDonneesCreation(donnees: DonneesDescriptionServiceV2) {
    if (!this.donneesObligatoiresRenseignees(donnees))
      throw new ErreurDonneesObligatoiresManquantes();
    if (
      !this.niveauSecuriteChoisiSuffisant(
        {
          disponibilite: donnees.dureeDysfonctionnementAcceptable,
          autresDonneesTraitees:
            donnees.categoriesDonneesTraiteesSupplementaires,
          categories: donnees.categoriesDonneesTraitees,
          volumetrie: donnees.volumetrieDonneesTraitees,
          audienceCible: donnees.audienceCible,
          ouvertureSysteme: donnees.ouvertureSysteme,
        },
        donnees.niveauSecurite
      )
    )
      throw new ErreurDonneesNiveauSecuriteInsuffisant();
  }

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return InformationsService.COMPLETES;
  }

  toJSON() {
    return this.donneesSerialisees();
  }

  donneesSerialisees(): DonneesDescriptionServiceV2 {
    const dedoublonne = <T>(tableau: Array<T>) => [...new Set(tableau)];

    return {
      activitesExternalisees: dedoublonne(this.activitesExternalisees),
      audienceCible: this.audienceCible,
      categoriesDonneesTraitees: dedoublonne(this.categoriesDonneesTraitees),
      categoriesDonneesTraiteesSupplementaires: dedoublonne(
        this.categoriesDonneesTraiteesSupplementaires
      ),
      dureeDysfonctionnementAcceptable: this.dureeDysfonctionnementAcceptable,
      localisationDonneesTraitees: this.localisationDonneesTraitees,
      niveauSecurite: this.niveauSecurite,
      nomService: this.nomService,
      organisationResponsable:
        this.organisationResponsable.toJSON() as DonneesEntite,
      ouvertureSysteme: this.ouvertureSysteme,
      pointsAcces: dedoublonne(
        (
          this.pointsAcces.donneesSerialisees() as { description: string }[]
        ).map((p) => p.description)
      ).map((p) => ({ description: p })),
      presentation: this.presentation,
      specificitesProjet: dedoublonne(this.specificitesProjet),
      statutDeploiement: this.statutDeploiement,
      typeHebergement: this.typeHebergement,
      typeService: dedoublonne(this.typeService),
      volumetrieDonneesTraitees: this.volumetrieDonneesTraitees,
    };
  }

  static niveauSecuriteMinimalRequis(
    donnees: PourCalculNiveauSecurite
  ): NiveauSecurite {
    return niveauSecuriteRequis(donnees);
  }

  estimeNiveauDeSecurite() {
    return niveauSecuriteRequis({
      volumetrie: this.volumetrieDonneesTraitees,
      categories: this.categoriesDonneesTraitees,
      autresDonneesTraitees: this.categoriesDonneesTraiteesSupplementaires,
      disponibilite: this.dureeDysfonctionnementAcceptable,
      audienceCible: this.audienceCible,
      ouvertureSysteme: this.ouvertureSysteme,
    });
  }

  niveauSecuriteDepasseRecommandation() {
    const niveauRecommande = this.estimeNiveauDeSecurite();
    return (
      questionsV2.niveauSecurite[this.niveauSecurite].position >
      questionsV2.niveauSecurite[niveauRecommande].position
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
      donneesHorsUE: this.localisationDonneesTraitees === 'horsUE',
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

  descriptionLocalisationDonnees(): string {
    return this.referentiel.localisationDonnees(
      this.localisationDonneesTraitees
    ).nom;
  }

  descriptionTypeService() {
    return this.typeService
      .map((t) => this.referentiel.typeService(t).nom)
      .join(', ');
  }

  descriptionStatutDeploiement() {
    return this.referentiel.descriptionStatutDeploiement(
      this.statutDeploiement
    );
  }
}

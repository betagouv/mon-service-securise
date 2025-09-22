import Entite from './entite.js';
import InformationsService from './informationsService.js';
import {
  CategorieDonneesTraitees,
  questionsV2,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';
import donneesReferentiel from '../../donneesReferentiel.js';
import PointsAcces from './pointsAcces.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};

export type StatutDeploiement =
  keyof typeof donneesReferentiel.statutsDeploiement;
export type TypeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;
export type ActiviteExternalisee =
  keyof typeof questionsV2.activiteExternalisee;
export type OuvertureSysteme = keyof typeof questionsV2.ouvertureSysteme;
export type AudienceCible = keyof typeof questionsV2.audienceCible;

export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
  niveauDeSecurite: string;
  categorieDonneesTraitees: CategorieDonneesTraitees;
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  statutDeploiement: StatutDeploiement;
  presentation: string;
  pointsAcces: { description: string }[];
  typeService: TypeService[];
  specificitesProjet: SpecificiteProjet[];
  typeHebergement: TypeHebergement;
  activitesExternalisees: ActiviteExternalisee[];
  ouvertureSysteme: OuvertureSysteme;
  audienceCible: AudienceCible;
};

export class DescriptionServiceV2 {
  readonly nomService: string;
  readonly organisationResponsable: Entite;
  readonly niveauDeSecurite: string;
  readonly statutDeploiement: StatutDeploiement;
  readonly categorieDonneesTraitees: CategorieDonneesTraitees;
  readonly volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  private readonly presentation: string;
  private readonly pointsAcces: PointsAcces;
  private readonly typeService: TypeService[];
  private readonly specificitesProjet: SpecificiteProjet[];
  private readonly typeHebergement: TypeHebergement;
  private readonly activitesExternalisees: ActiviteExternalisee[];
  private readonly ouvertureSysteme: OuvertureSysteme;
  private readonly audienceCible: AudienceCible;

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    this.statutDeploiement = donnees.statutDeploiement;
    this.niveauDeSecurite = donnees.niveauDeSecurite;
    this.categorieDonneesTraitees = donnees.categorieDonneesTraitees;
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
  }

  static valideDonneesCreation() {}

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return InformationsService.COMPLETES;
  }

  donneesSerialisees(): DonneesDescriptionServiceV2 {
    return {
      categorieDonneesTraitees: this.categorieDonneesTraitees,
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
    };
  }
}

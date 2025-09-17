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

export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
  niveauDeSecurite: string;
  categorieDonneesTraitees: CategorieDonneesTraitees;
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
  statutDeploiement: StatutDeploiement;
  presentation: string;
  pointsAcces?: { description: string }[];
  typeService?: [keyof typeof questionsV2.typeDeService];
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
    };
  }
}

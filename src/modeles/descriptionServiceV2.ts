import Entite from './entite.js';
import InformationsService from './informationsService.js';
import {
  CategorieDonneesTraitees,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};
export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
  niveauDeSecurite: string;
  categorieDonneesTraitees: CategorieDonneesTraitees;
  volumetrieDonneesTraitees: VolumetrieDonneesTraitees;
};

export class DescriptionServiceV2 {
  readonly nomService: string;
  readonly organisationResponsable: Entite;
  readonly niveauDeSecurite: string;
  readonly categorieDonneesTraitees: CategorieDonneesTraitees;
  readonly volumetrieDonneesTraitees: VolumetrieDonneesTraitees;

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    this.niveauDeSecurite = donnees.niveauDeSecurite;
    this.categorieDonneesTraitees = donnees.categorieDonneesTraitees;
    this.volumetrieDonneesTraitees = donnees.volumetrieDonneesTraitees;
  }

  static valideDonneesCreation() {}

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return InformationsService.COMPLETES;
  }
}

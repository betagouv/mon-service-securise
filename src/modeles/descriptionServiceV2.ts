import Entite from './entite.js';
import InformationsService from './informationsService.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};
export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
  niveauDeSecurite: string;
};

export class DescriptionServiceV2 {
  readonly nomService: string;
  readonly organisationResponsable: Entite;
  readonly niveauDeSecurite: string;

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    this.niveauDeSecurite = donnees.niveauDeSecurite;
  }

  static valideDonneesCreation() {}

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return InformationsService.COMPLETES;
  }
}

import Entite from './entite.js';
import { STATUTS_SAISIE } from './informationsService.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};
export type DonneesDescriptionServiceV2 = {
  nomService: string;
  organisationResponsable: DonneesEntite;
};

export class DescriptionServiceV2 {
  readonly nomService: string;
  readonly organisationResponsable: Entite;

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
  }

  static valideDonneesCreation() {}

  // eslint-disable-next-line class-methods-use-this
  statutSaisie() {
    return STATUTS_SAISIE.COMPLETES;
  }
}

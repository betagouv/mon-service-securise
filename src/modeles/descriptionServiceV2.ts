export type DonneesDescriptionServiceV2 = {
  nomService: string;
};

export class DescriptionServiceV2 {
  readonly nomService: string;

  constructor(donnees: DonneesDescriptionServiceV2) {
    this.nomService = donnees.nomService;
  }

  static valideDonneesCreation() {}
}

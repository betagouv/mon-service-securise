import InformationsService from './informationsService.js';

export type DonneesItemAvecDescription = {
  description: string;
};

class ItemAvecDescription extends InformationsService {
  readonly description!: string;

  constructor(
    donneesItemAvecDescription: Partial<DonneesItemAvecDescription> = {}
  ) {
    super({ proprietesAtomiquesRequises: ['description'] });
    this.renseigneProprietes(donneesItemAvecDescription);
  }

  static proprietes() {
    return ['description'];
  }
}

export default ItemAvecDescription;

import InformationsService from './informationsService.js';

class ItemAvecDescription extends InformationsService {
  constructor(donneesItemAvecDescription) {
    super({ proprietesAtomiquesRequises: ['description'] });
    this.renseigneProprietes(donneesItemAvecDescription);
  }

  static proprietes() {
    return ['description'];
  }
}

export default ItemAvecDescription;

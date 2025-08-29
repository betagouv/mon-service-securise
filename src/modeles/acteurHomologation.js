import InformationsService from './informationsService.js';

class ActeurHomologation extends InformationsService {
  constructor(donnees) {
    super({ proprietesAtomiquesRequises: ['role', 'nom', 'fonction'] });
    this.renseigneProprietes(donnees);
  }

  static proprietes() {
    return ['role', 'nom', 'fonction'];
  }
}

export default ActeurHomologation;

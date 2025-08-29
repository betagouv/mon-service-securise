import InformationsService from './informationsService.js';

class EntiteExterne extends InformationsService {
  constructor(donneesEntite) {
    super({
      proprietesAtomiquesRequises: ['nom', 'contact'],
      proprietesAtomiquesFacultatives: ['acces'],
    });
    this.renseigneProprietes(donneesEntite);
  }
}

export default EntiteExterne;

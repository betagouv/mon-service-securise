import InformationsService from './informationsService.js';

export type DonneesActeurHomologation = {
  role: string;
  nom: string;
  fonction: string;
};

class ActeurHomologation extends InformationsService {
  readonly role!: string;
  readonly nom!: string;
  readonly fonction!: string;

  constructor(donnees: Partial<DonneesActeurHomologation>) {
    super({ proprietesAtomiquesRequises: ['role', 'nom', 'fonction'] });
    this.renseigneProprietes(donnees);
  }

  static proprietes() {
    return ['role', 'nom', 'fonction'];
  }
}

export default ActeurHomologation;

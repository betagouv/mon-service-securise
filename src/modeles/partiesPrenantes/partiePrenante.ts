import InformationsService from '../informationsService.js';

export type DonneesPartiePrenante = {
  nom: string;
  natureAcces?: string;
  pointContact?: string;
};

class PartiePrenante extends InformationsService {
  readonly nom!: string;
  readonly natureAcces?: string;
  readonly pointContact?: string;

  constructor(donnees: Partial<DonneesPartiePrenante> = {}) {
    super({
      proprietesAtomiquesRequises: ['nom'],
      proprietesAtomiquesFacultatives: ['natureAcces', 'pointContact'],
    });

    this.renseigneProprietes(donnees);
  }

  estDeType(Type: { name: string } | null) {
    return this.constructor.name === Type?.name;
  }

  toJSON(): DonneesPartiePrenante & { type: string } {
    return {
      ...(super.toJSON() as DonneesPartiePrenante),
      type: this.constructor.name,
    };
  }

  static proprietes() {
    return ['nom', 'natureAcces', 'pointContact'];
  }
}

export default PartiePrenante;

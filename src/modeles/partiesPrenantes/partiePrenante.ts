const InformationsService = require('../informationsService');

class PartiePrenante extends InformationsService {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['nom'],
      proprietesAtomiquesFacultatives: ['natureAcces', 'pointContact'],
    });

    this.renseigneProprietes(donnees);
  }

  estDeType(Type) {
    return this.constructor.name === Type?.name;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: this.constructor.name,
    };
  }

  static proprietes() {
    return ['nom', 'natureAcces', 'pointContact'];
  }
}

module.exports = PartiePrenante;

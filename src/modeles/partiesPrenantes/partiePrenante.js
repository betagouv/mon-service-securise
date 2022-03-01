const InformationsHomologation = require('../informationsHomologation');

class PartiePrenante extends InformationsHomologation {
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
}

module.exports = PartiePrenante;

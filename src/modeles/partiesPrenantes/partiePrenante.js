const InformationsHomologation = require('../informationsHomologation');

class PartiePrenante extends InformationsHomologation {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['nom'],
      proprietesAtomiquesFacultatives: ['natureAcces', 'pointContact'],
    });

    this.renseigneProprietes(donnees);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: this.constructor.name,
    };
  }
}

module.exports = PartiePrenante;

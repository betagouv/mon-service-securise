const InformationsHomologation = require('../informationsHomologation');

class PartiePrenante extends InformationsHomologation {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['nom'],
      proprietesAtomiquesFacultatives: ['natureAcces', 'pointContact'],
    });

    this.type = donnees.type;
    this.renseigneProprietes(donnees);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
    };
  }
}

module.exports = PartiePrenante;

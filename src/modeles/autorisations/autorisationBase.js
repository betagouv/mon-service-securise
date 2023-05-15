const Base = require('../base');

class AutorisationBase extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'idUtilisateur',
        'idHomologation',
        'idService',
      ],
    });
    this.renseigneProprietes(donnees);

    this.permissionAjoutContributeur = false;
    this.permissionSuppressionContributeur = false;
    this.permissionSuppressionService = false;
  }
}

module.exports = AutorisationBase;

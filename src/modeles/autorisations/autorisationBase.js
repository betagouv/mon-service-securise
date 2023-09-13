const Base = require('../base');

class AutorisationBase extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'idUtilisateur',
        'idHomologation',
        'idService',
        'droits',
      ],
    });
    this.renseigneProprietes(donnees);

    this.permissionAjoutContributeur = false;
    this.permissionSuppressionContributeur = false;
    this.permissionSuppressionService = false;
  }

  aLaPermission(niveau, rubrique) {
    return this.droits[rubrique] >= niveau;
  }

  aLesPermissions(droits) {
    return Object.entries(droits).every(([rubrique, niveau]) =>
      this.aLaPermission(niveau, rubrique)
    );
  }
}

module.exports = AutorisationBase;

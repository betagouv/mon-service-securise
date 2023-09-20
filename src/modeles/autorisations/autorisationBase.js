const Base = require('../base');
const {
  Rubriques: { DECRIRE, SECURISER, RISQUES, HOMOLOGUER },
  Permissions: { LECTURE },
} = require('./gestionDroits');

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

  static DROITS_ANNEXES_PDF = {
    [DECRIRE]: LECTURE,
    [SECURISER]: LECTURE,
    [RISQUES]: LECTURE,
  };

  static DROITS_DOSSIER_DECISION_PDF = {
    [HOMOLOGUER]: LECTURE,
  };

  static DROIT_SYNTHESE_SECURITE_PDF = {
    [SECURISER]: LECTURE,
    [DECRIRE]: LECTURE,
  };
}

module.exports = AutorisationBase;

const Base = require('../base');
const {
  Rubriques: { DECRIRE, SECURISER, RISQUES, HOMOLOGUER },
  Permissions: { LECTURE, ECRITURE },
  Rubriques,
  Permissions,
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

  peutGererContributeurs() {
    return (
      this.permissionAjoutContributeur && this.permissionSuppressionContributeur
    );
  }

  resumeNiveauDroit() {
    const tousNiveaux = Object.values(Permissions).reduce(
      (acc, niveau) => ({ ...acc, [niveau]: 0 }),
      {}
    );
    const toutesRubriques = Object.keys(Rubriques);
    const totalRubriques = toutesRubriques.length;

    toutesRubriques.forEach((rubrique) => {
      const droitPourRubrique = this.droits[rubrique];
      tousNiveaux[droitPourRubrique] += 1;
    });

    if (tousNiveaux[ECRITURE] === totalRubriques)
      return AutorisationBase.RESUME_NIVEAU_DROIT.ECRITURE;
    if (tousNiveaux[LECTURE] === totalRubriques)
      return AutorisationBase.RESUME_NIVEAU_DROIT.LECTURE;

    return AutorisationBase.RESUME_NIVEAU_DROIT.PERSONNALISE;
  }

  static RESUME_NIVEAU_DROIT = {
    ECRITURE: 'ECRITURE',
    LECTURE: 'LECTURE',
    PERSONNALISE: 'PERSONNALISE',
  };

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

const Base = require('../base');
const {
  Rubriques: { DECRIRE, SECURISER, RISQUES, HOMOLOGUER, CONTACTS },
  Permissions: { LECTURE, ECRITURE },
  Rubriques,
  Permissions,
  tousDroitsEnEcriture,
} = require('./gestionDroits');

class AutorisationBase extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: [
        'estProprietaire',
        'id',
        'idUtilisateur',
        'idHomologation',
        'idService',
        'droits',
        'type',
      ],
    });
    this.renseigneProprietes(donnees);
  }

  static NouvelleAutorisationContributeur = (donnees = {}) =>
    new AutorisationBase({
      ...donnees,
      estProprietaire: false,
      type: 'contributeur',
    });

  static NouvelleAutorisationProprietaire = (donnees = {}) =>
    new AutorisationBase({
      ...donnees,
      droits: tousDroitsEnEcriture(),
      estProprietaire: true,
      type: 'createur',
    });

  aLaPermission(niveau, rubrique) {
    return this.droits[rubrique] >= niveau;
  }

  aLesPermissions(droits) {
    return Object.entries(droits).every(([rubrique, niveau]) =>
      this.aLaPermission(niveau, rubrique)
    );
  }

  peutDupliquer() {
    return this.estProprietaire;
  }

  peutGererContributeurs() {
    return this.estProprietaire;
  }

  peutHomologuer() {
    return this.aLesPermissions(AutorisationBase.DROITS_HOMOLOGUER);
  }

  peutSupprimerService() {
    return this.estProprietaire;
  }

  resumeNiveauDroit() {
    const { RESUME_NIVEAU_DROIT } = AutorisationBase;

    if (this.estProprietaire) return RESUME_NIVEAU_DROIT.PROPRIETAIRE;

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
      return RESUME_NIVEAU_DROIT.ECRITURE;
    if (tousNiveaux[LECTURE] === totalRubriques)
      return RESUME_NIVEAU_DROIT.LECTURE;

    return RESUME_NIVEAU_DROIT.PERSONNALISE;
  }

  donneesAPersister() {
    return {
      estProprietaire: this.estProprietaire,
      id: this.id,
      idService: this.idService,
      idHomologation: this.idService,
      idUtilisateur: this.idUtilisateur,
      droits: this.droits,
      type: this.type,
    };
  }

  static RESUME_NIVEAU_DROIT = {
    PROPRIETAIRE: 'PROPRIETAIRE',
    ECRITURE: 'ECRITURE',
    LECTURE: 'LECTURE',
    PERSONNALISE: 'PERSONNALISE',
  };

  static DROITS_HOMOLOGUER = {
    [DECRIRE]: ECRITURE,
    [SECURISER]: ECRITURE,
    [HOMOLOGUER]: ECRITURE,
    [RISQUES]: ECRITURE,
    [CONTACTS]: ECRITURE,
  };

  static DROITS_VOIR_INDICE_CYBER = {
    [SECURISER]: LECTURE,
  };

  static DROITS_VOIR_STATUT_HOMOLOGATION = {
    [HOMOLOGUER]: LECTURE,
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

  appliqueDroits(nouveauxDroits) {
    this.droits = { ...this.droits, ...nouveauxDroits };
  }
}

module.exports = AutorisationBase;

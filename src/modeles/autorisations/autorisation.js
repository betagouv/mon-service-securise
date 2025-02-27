const Base = require('../base');
const {
  Rubriques: { DECRIRE, SECURISER, RISQUES, HOMOLOGUER },
  Permissions: { LECTURE, ECRITURE },
  Rubriques,
  Permissions,
  tousDroitsEnEcriture,
} = require('./gestionDroits');

class Autorisation extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: [
        'estProprietaire',
        'id',
        'idUtilisateur',
        'idService',
        'droits',
        'type',
      ],
    });
    this.renseigneProprietes(donnees);
  }

  static NouvelleAutorisationContributeur = (donnees = {}) =>
    new Autorisation({ ...donnees, estProprietaire: false });

  static NouvelleAutorisationProprietaire = (donnees = {}) =>
    new Autorisation({
      ...donnees,
      droits: tousDroitsEnEcriture(),
      estProprietaire: true,
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
    return this.estProprietaire;
  }

  peutSupprimerService() {
    return this.estProprietaire;
  }

  resumeNiveauDroit() {
    const { RESUME_NIVEAU_DROIT } = Autorisation;

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

  designeUtilisateur(idUtilisateur) {
    return this.idUtilisateur === idUtilisateur;
  }

  donneesAPersister() {
    return {
      estProprietaire: this.estProprietaire,
      id: this.id,
      idService: this.idService,
      idUtilisateur: this.idUtilisateur,
      droits: this.droits,
    };
  }

  static RESUME_NIVEAU_DROIT = {
    PROPRIETAIRE: 'PROPRIETAIRE',
    ECRITURE: 'ECRITURE',
    LECTURE: 'LECTURE',
    PERSONNALISE: 'PERSONNALISE',
  };

  static DROITS_VOIR_INDICE_CYBER = {
    [SECURISER]: LECTURE,
  };

  static DROITS_VOIR_MESURES = {
    [SECURISER]: LECTURE,
  };

  static DROITS_EDITER_MESURES = {
    [SECURISER]: ECRITURE,
  };

  static DROITS_VOIR_STATUT_HOMOLOGATION = {
    [HOMOLOGUER]: LECTURE,
  };

  static DROITS_EDITER_HOMOLOGATION = {
    [HOMOLOGUER]: ECRITURE,
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

  static DROIT_TAMPON_HOMOLOGATION_ZIP = {
    [HOMOLOGUER]: LECTURE,
    [DECRIRE]: LECTURE,
  };

  static DROIT_INVITER_CONTRIBUTEUR = 'peutInviterContributeur';

  static DROITS_EDITER_DESCRIPTION = {
    [DECRIRE]: ECRITURE,
  };

  static DROITS_VOIR_DESCRIPTION = {
    [DECRIRE]: LECTURE,
  };

  appliqueDroits(nouveauxDroits) {
    if (nouveauxDroits.estProprietaire) {
      this.estProprietaire = true;
      this.droits = tousDroitsEnEcriture();
      return;
    }

    this.estProprietaire = false;
    this.droits = { ...this.droits, ...nouveauxDroits };
  }

  peutFaireActionRecommandee(actionRecommandee) {
    if (
      actionRecommandee.droitsNecessaires ===
      Autorisation.DROIT_INVITER_CONTRIBUTEUR
    )
      return this.peutGererContributeurs();

    return this.aLesPermissions(actionRecommandee.droitsNecessaires);
  }
}

module.exports = Autorisation;

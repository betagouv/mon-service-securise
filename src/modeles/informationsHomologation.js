const Base = require('./base');

const { pagination } = require('../utilitaires/pagination');

const STATUTS_SAISIE = {
  A_SAISIR: 'aSaisir',
  A_COMPLETER: 'aCompleter',
  COMPLETES: 'completes',
};

class InformationsHomologation extends Base {
  aucunAgregatSaisi() {
    return Object.keys(this.listesAgregats).every(
      (l) => this[l].statutSaisie() === InformationsHomologation.A_SAISIR
    );
  }

  auMoinsUnAgregatACompleter() {
    return Object.keys(this.listesAgregats).some(
      (l) => this[l].statutSaisie() === InformationsHomologation.A_COMPLETER
    );
  }

  pagines(nbElementsParPage) {
    const tousLesElements = Object.keys(this.listesAgregats).flatMap((l) =>
      this[l].tous()
    );
    return pagination(nbElementsParPage, tousLesElements);
  }

  paginees(...params) {
    return this.pagines(...params);
  }

  statutSaisie() {
    switch (this.statutSaisieAgregats()) {
      case InformationsHomologation.A_COMPLETER:
        return InformationsHomologation.A_COMPLETER;
      case InformationsHomologation.COMPLETES:
        return this.statutSaisieProprietesAtomiques() ===
          InformationsHomologation.COMPLETES
          ? InformationsHomologation.COMPLETES
          : InformationsHomologation.A_COMPLETER;
      default:
        return this.aucuneProprieteAtomiqueRequise()
          ? InformationsHomologation.A_SAISIR
          : this.statutSaisieProprietesAtomiques();
    }
  }

  statutSaisieProprietesAtomiques() {
    const proprietesSaisies = this.proprietesAtomiquesRequises.filter(
      this.proprieteSaisie,
      this
    );

    if (this.proprietesAtomiquesRequises.length === proprietesSaisies.length) {
      return InformationsHomologation.COMPLETES;
    }
    if (proprietesSaisies.length === 0)
      return InformationsHomologation.A_SAISIR;
    return InformationsHomologation.A_COMPLETER;
  }

  statutSaisieAgregats() {
    if (this.aucunAgregatSaisi()) return InformationsHomologation.A_SAISIR;
    if (this.auMoinsUnAgregatACompleter())
      return InformationsHomologation.A_COMPLETER;
    return InformationsHomologation.COMPLETES;
  }
}

Object.assign(InformationsHomologation, STATUTS_SAISIE);
module.exports = InformationsHomologation;

const Base = require('./base');

const STATUTS_SAISIE = {
  A_SAISIR: 'aSaisir',
  A_COMPLETER: 'aCompleter',
  COMPLETES: 'completes',
};

class InformationsService extends Base {
  aucunAgregatSaisi() {
    return Object.keys(this.listesAgregats).every(
      (l) => this[l].statutSaisie() === InformationsService.A_SAISIR
    );
  }

  auMoinsUnAgregatACompleter() {
    return Object.keys(this.listesAgregats).some(
      (l) => this[l].statutSaisie() === InformationsService.A_COMPLETER
    );
  }

  statutSaisie() {
    switch (this.statutSaisieAgregats()) {
      case InformationsService.A_COMPLETER:
        return InformationsService.A_COMPLETER;
      case InformationsService.COMPLETES:
        return this.statutSaisieProprietesAtomiques() ===
          InformationsService.COMPLETES
          ? InformationsService.COMPLETES
          : InformationsService.A_COMPLETER;
      default:
        return this.aucuneProprieteAtomiqueRequise()
          ? InformationsService.A_SAISIR
          : this.statutSaisieProprietesAtomiques();
    }
  }

  statutSaisieProprietesAtomiques() {
    const proprietesSaisies = this.proprietesAtomiquesRequises.filter(
      this.proprieteSaisie,
      this
    );

    if (this.proprietesAtomiquesRequises.length === proprietesSaisies.length) {
      return InformationsService.COMPLETES;
    }
    if (proprietesSaisies.length === 0) return InformationsService.A_SAISIR;
    return InformationsService.A_COMPLETER;
  }

  statutSaisieAgregats() {
    if (this.aucunAgregatSaisi()) return InformationsService.A_SAISIR;
    if (this.auMoinsUnAgregatACompleter())
      return InformationsService.A_COMPLETER;
    return InformationsService.COMPLETES;
  }
}

Object.assign(InformationsService, STATUTS_SAISIE);
module.exports = InformationsService;

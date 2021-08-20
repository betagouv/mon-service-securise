const Base = require('./base');

const STATUTS_SAISIE = {
  A_SAISIR: 'aSaisir',
  A_COMPLETER: 'aCompleter',
  COMPLETES: 'completes',
};

class InformationsHomologation extends Base {
  statutSaisie() {
    const nomsProprietesSaisies = this.nomsProprietesAtomiques.filter(this.proprieteSaisie, this);

    if (nomsProprietesSaisies.length === 0) return InformationsHomologation.A_SAISIR;
    if (this.nomsProprietesAtomiques.length === nomsProprietesSaisies.length) {
      return InformationsHomologation.COMPLETES;
    }
    return InformationsHomologation.A_COMPLETER;
  }
}

Object.assign(InformationsHomologation, STATUTS_SAISIE);
module.exports = InformationsHomologation;

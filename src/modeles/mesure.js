const Base = require('./base');
const { ErreurStatutMesureInvalide } = require('../erreurs');

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_PLANIFIE: 'planifie',
  STATUT_NON_RETENU: 'nonRetenu',
};

class Mesure extends Base {
  static statutsPossibles() { return Object.values(STATUTS); }

  static valide({ statut }) {
    if (!this.statutsPossibles().includes(statut)) {
      throw new ErreurStatutMesureInvalide(`Le statut "${statut}" est invalide`);
    }
  }
}

Object.assign(Mesure, STATUTS);

module.exports = Mesure;

class Mesure {
  constructor({ id, statut, modalites }) {
    this.id = id;
    this.statut = statut;
    this.modalites = modalites;
  }
}

Mesure.STATUT_FAIT = 'fait';
Mesure.STATUT_PLANIFIE = 'planifie';
Mesure.STATUT_NON_RETENU = 'nonRetenu';

module.exports = Mesure;

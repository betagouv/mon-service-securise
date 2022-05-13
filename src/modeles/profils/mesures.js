class Mesures {
  constructor({ ajouter, retirer } = {}) {
    this.ajouter = ajouter || [];
    this.retirer = retirer || [];
  }
}

module.exports = Mesures;

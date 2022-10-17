class Mesures {
  constructor({ ajouter = [], retirer = [], rendreIndispensables = [] } = {}) {
    this.ajouter = ajouter;
    this.retirer = retirer;
    this.rendreIndispensables = rendreIndispensables;
  }
}

module.exports = Mesures;

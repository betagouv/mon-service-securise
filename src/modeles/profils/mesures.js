class Mesures {
  constructor({ ajouter = [], retirer = [], rendreIndispensables = [] } = {}) {
    this.ajouter = ajouter;
    this.retirer = retirer;
    this.rendreIndispensables = rendreIndispensables;
  }
}

export default Mesures;

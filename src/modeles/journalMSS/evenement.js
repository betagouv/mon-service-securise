const {
  fabriqueAdaptateurChiffrement,
} = require('../../adaptateurs/fabriqueAdaptateurChiffrement');

class Evenement {
  static optionsParDefaut(options) {
    return {
      date: options.date ?? Date.now(),
      adaptateurChiffrement:
        options.adaptateurChiffrement ?? fabriqueAdaptateurChiffrement(),
    };
  }

  constructor(type, donnees, date) {
    this.type = type;
    this.donnees = donnees;
    this.date = date;
  }

  toJSON() {
    return {
      type: this.type,
      donnees: this.donnees,
      date: this.date,
    };
  }
}

module.exports = Evenement;

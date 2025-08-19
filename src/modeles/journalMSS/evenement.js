const {
  fabriqueAdaptateurChiffrement,
} = require('../../adaptateurs/fabriqueAdaptateurChiffrement');
const { ErreurDonneeManquante } = require('./erreurs');

class Evenement {
  static optionsParDefaut(options) {
    return {
      date: options.date ?? Date.now(),
      adaptateurChiffrement:
        options.adaptateurChiffrement ?? fabriqueAdaptateurChiffrement(),
    };
  }

  static valide(donnees, proprietesRequises) {
    const manque = (valeur) => typeof valeur === 'undefined' || valeur === null;

    proprietesRequises.forEach((requise) => {
      if (manque(donnees[requise])) throw new ErreurDonneeManquante(requise);
    });
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

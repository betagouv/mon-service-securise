const Regle = require('./regle');

class Regles {
  constructor(regles = []) {
    this.regles = regles.map((regle) => new Regle(regle));
  }

  sontVides() {
    return this.regles.length === 0;
  }

  sontMultiples() {
    return this.regles.length > 1;
  }

  toutes() {
    return this.regles;
  }
}

module.exports = Regles;

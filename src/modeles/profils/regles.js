import Regle from './regle.js';

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

export default Regles;

class Base {
  constructor(nomsProprietes) {
    this.nomsProprietes = nomsProprietes;
  }

  renseigneProprietes(donnees) {
    this.nomsProprietes.forEach((np) => (this[np] = donnees[np]));
  }

  toJSON() {
    const resultat = {};
    this.nomsProprietes
      .filter((k) => typeof this[k] !== 'undefined')
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = Base;

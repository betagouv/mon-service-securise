class Base {
  constructor(nomsProprietesAtomiques = [], nomsProprietesListes = []) {
    this.nomsProprietesAtomiques = nomsProprietesAtomiques;
    this.nomsProprietesListes = nomsProprietesListes;
  }

  renseigneProprietes(donnees) {
    this.nomsProprietesAtomiques.forEach((np) => (this[np] = donnees[np]));
    this.nomsProprietesListes.forEach((np) => (this[np] = donnees[np] || []));
  }

  proprieteSaisie(nomPropriete) {
    const valeur = this[nomPropriete];
    if (typeof valeur === 'string') return valeur !== '';
    return typeof valeur !== 'undefined';
  }

  toJSON() {
    const resultat = {};

    [...this.nomsProprietesAtomiques, ...this.nomsProprietesListes]
      .filter((k) => typeof this[k] !== 'undefined')
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = Base;

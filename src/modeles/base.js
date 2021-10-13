class Base {
  constructor(nomsProprietesAtomiques = [], nomsProprietesListes = [], nomsListesAgregats = {}) {
    this.nomsProprietesAtomiques = nomsProprietesAtomiques;
    this.nomsProprietesListes = nomsProprietesListes;
    this.nomsListesAgregats = nomsListesAgregats;
  }

  renseigneProprietes(donnees, referentiel) {
    this.nomsProprietesAtomiques.forEach((np) => (this[np] = donnees[np]));
    this.nomsProprietesListes.forEach((np) => (this[np] = donnees[np] || []));
    Object.keys(this.nomsListesAgregats).forEach((nl) => {
      const ClasseListeAgregats = this.nomsListesAgregats[nl];
      const donneesListeAgregat = { [nl]: donnees[nl] || [] };
      this[nl] = new ClasseListeAgregats(donneesListeAgregat, referentiel);
    });
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

    Object.keys(this.nomsListesAgregats).forEach((nl) => {
      Object.assign(resultat, { [nl]: this[nl].toJSON() });
    });

    return resultat;
  }
}

module.exports = Base;

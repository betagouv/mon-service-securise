const proprietePresente = (valeur) => {
  if (Array.isArray(valeur)) {
    return valeur.length && valeur.every((item) => proprietePresente(item));
  }

  switch (typeof valeur) {
    case 'undefined': return false;
    case 'boolean': return true;
    case 'string': return valeur.length > 0;
    case 'number': return !Number.isNaN(valeur);
    case 'object': return valeur !== null && Object.keys(valeur).length !== 0;
    default: return false;
  }
};

class Base {
  constructor(proprietes = {}) {
    const {
      proprietesAtomiquesRequises = [],
      proprietesAtomiquesFacultatives = [],
      proprietesListes = [],
      listesAgregats = {},
    } = proprietes;
    this.proprietesAtomiquesRequises = proprietesAtomiquesRequises;
    this.proprietesAtomiquesFacultatives = proprietesAtomiquesFacultatives;
    this.proprietesListes = proprietesListes;
    this.listesAgregats = listesAgregats;
  }

  aucuneProprieteAtomiqueRequise() {
    return this.proprietesAtomiquesRequises.length === 0;
  }

  donneesSerialisees() {
    return this.toJSON();
  }

  renseigneProprietes(donnees, referentiel) {
    [...this.proprietesAtomiquesRequises, ...this.proprietesAtomiquesFacultatives]
      .forEach((p) => (this[p] = donnees[p]));
    this.proprietesListes.forEach((p) => (this[p] = donnees[p] || []));
    Object.keys(this.listesAgregats).forEach((l) => {
      const ClasseListeAgregats = this.listesAgregats[l];
      const donneesListeAgregat = { [l]: donnees[l] || [] };
      this[l] = new ClasseListeAgregats(donneesListeAgregat, referentiel);
    });
  }

  proprieteSaisie(nomPropriete) {
    const valeur = this[nomPropriete];
    if (typeof valeur === 'string') return valeur !== '';
    return typeof valeur !== 'undefined';
  }

  toJSON() {
    const resultat = {};

    [
      ...this.proprietesAtomiquesRequises,
      ...this.proprietesAtomiquesFacultatives,
      ...this.proprietesListes,
    ]
      .filter((k) => typeof this[k] !== 'undefined')
      .forEach((k) => (resultat[k] = this[k]));

    Object.keys(this.listesAgregats).forEach((l) => {
      Object.assign(resultat, { [l]: this[l].toJSON() });
    });

    return resultat;
  }

  static proprietesObligatoires() {
    return [];
  }

  static proprietesObligatoiresRenseignees(donnees) {
    return this.proprietesObligatoires()
      .every((propriete) => proprietePresente(donnees?.[propriete]));
  }
}

module.exports = Base;

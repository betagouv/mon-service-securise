const InformationsHomologation = require('./informationsHomologation');

class ListeItems extends InformationsHomologation {
  constructor(ClasseItem, donnees, referentiel) {
    super();
    const { items } = donnees;
    this.items = items.map((donneesItem) => new ClasseItem(donneesItem, referentiel));
    this.referentiel = referentiel;
  }

  item(index) {
    return this.items[index];
  }

  nombre() {
    return this.items.length;
  }

  statutSaisie() {
    if (this.nombre() === 0) return InformationsHomologation.A_SAISIR;

    return this.items.every((i) => i.statutSaisie() === InformationsHomologation.COMPLETES)
      ? InformationsHomologation.COMPLETES
      : InformationsHomologation.A_COMPLETER;
  }

  toJSON() {
    return this.items.map((i) => i.toJSON());
  }
}

module.exports = ListeItems;

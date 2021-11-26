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

  pagines(nbItemsParPage) {
    let page = -1;
    return this.items.reduce((acc, item, index) => {
      if (index % nbItemsParPage === 0) page += 1;
      acc[page] ||= [];
      acc[page].push(item);
      return acc;
    }, [[]]);
  }

  paginees(...params) {
    return this.pagines(...params);
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

const InformationsHomologation = require('./informationsHomologation');
const { pagination } = require('../utilitaires/pagination');

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
    return pagination(nbItemsParPage, this.items);
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

  tous() {
    return this.items;
  }
}

module.exports = ListeItems;

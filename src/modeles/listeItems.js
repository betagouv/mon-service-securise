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

  toJSON() {
    return this.items.map((i) => i.toJSON());
  }
}

module.exports = ListeItems;

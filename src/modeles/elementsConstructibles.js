const ListeItems = require('./listeItems');

class ElementsConstructibles extends ListeItems {
  constructor(ClasseItem, donnees, referentiel) {
    super();
    const { items } = donnees;
    this.items = items.map((donneesItem) => new ClasseItem(donneesItem, referentiel));
    this.referentiel = referentiel;
  }
}

module.exports = ElementsConstructibles;

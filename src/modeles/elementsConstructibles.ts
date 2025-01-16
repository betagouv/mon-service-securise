const ListeItems = require('./listeItems');

class ElementsConstructibles extends ListeItems {
  constructor(ClasseItem, donnees, referentiel) {
    super(
      (donneesItem) => new ClasseItem(donneesItem, referentiel),
      donnees,
      referentiel
    );
  }
}

module.exports = ElementsConstructibles;

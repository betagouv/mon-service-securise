const ItemsAvecDescription = require('./itemsAvecDescription');

class FonctionnalitesSpecifiques extends ItemsAvecDescription {
  constructor(donnees) {
    super({ items: donnees.fonctionnalitesSpecifiques });
  }
}

module.exports = FonctionnalitesSpecifiques;

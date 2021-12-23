const ItemsAvecDescription = require('./itemsAvecDescription');

class DonneesSensiblesSpecifiques extends ItemsAvecDescription {
  constructor(donnees) {
    super({ items: donnees.donneesSensiblesSpecifiques });
  }
}

module.exports = DonneesSensiblesSpecifiques;

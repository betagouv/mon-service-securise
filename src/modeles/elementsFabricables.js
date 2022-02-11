const ListeItems = require('./listeItems');

class ElementsFabricables extends ListeItems {
  constructor(Fabrique, donnees) {
    super(Fabrique.cree, donnees);
  }
}

module.exports = ElementsFabricables;

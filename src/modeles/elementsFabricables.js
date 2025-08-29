import ListeItems from './listeItems.js';

class ElementsFabricables extends ListeItems {
  constructor(Fabrique, donnees) {
    super(Fabrique.cree, donnees);
  }
}

export default ElementsFabricables;

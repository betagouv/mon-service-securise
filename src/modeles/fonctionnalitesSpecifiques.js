import ItemsAvecDescription from './itemsAvecDescription.js';

class FonctionnalitesSpecifiques extends ItemsAvecDescription {
  constructor(donnees) {
    super({ items: donnees.fonctionnalitesSpecifiques });
  }
}

export default FonctionnalitesSpecifiques;

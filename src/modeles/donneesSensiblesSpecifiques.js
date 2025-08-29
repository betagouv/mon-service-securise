import ItemsAvecDescription from './itemsAvecDescription.js';

class DonneesSensiblesSpecifiques extends ItemsAvecDescription {
  constructor(donnees) {
    super({ items: donnees.donneesSensiblesSpecifiques });
  }
}

export default DonneesSensiblesSpecifiques;

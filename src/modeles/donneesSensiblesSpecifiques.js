import ItemsAvecDescription from './itemsAvecDescription.js';

class DonneesSensiblesSpecifiques extends ItemsAvecDescription {
  constructor(donnees, referentiel) {
    super({ items: donnees.donneesSensiblesSpecifiques }, referentiel);
  }
}

export default DonneesSensiblesSpecifiques;

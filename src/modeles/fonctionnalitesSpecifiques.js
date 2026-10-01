import ItemsAvecDescription from './itemsAvecDescription.js';

class FonctionnalitesSpecifiques extends ItemsAvecDescription {
  constructor(donnees, referentiel) {
    super({ items: donnees.fonctionnalitesSpecifiques }, referentiel);
  }
}

export default FonctionnalitesSpecifiques;

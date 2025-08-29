import ListeItems from './listeItems.js';

class ElementsConstructibles extends ListeItems {
  constructor(ClasseItem, donnees, referentiel) {
    super(
      (donneesItem) => new ClasseItem(donneesItem, referentiel),
      donnees,
      referentiel
    );
  }
}

export default ElementsConstructibles;

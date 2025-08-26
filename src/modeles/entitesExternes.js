import EntiteExterne from './entiteExterne.js';
import ElementsConstructibles from './elementsConstructibles.js';

class EntitesExternes extends ElementsConstructibles {
  constructor(donnees) {
    super(EntiteExterne, { items: donnees.entitesExternes });
  }
}

export default EntitesExternes;

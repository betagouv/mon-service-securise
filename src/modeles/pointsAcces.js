import ItemsAvecDescription from './itemsAvecDescription.js';

class PointsAcces extends ItemsAvecDescription {
  constructor(donnees, referentiel) {
    super({ items: donnees.pointsAcces }, referentiel);
  }
}

export default PointsAcces;

const ItemsAvecDescription = require('./itemsAvecDescription');

class PointsAcces extends ItemsAvecDescription {
  constructor(donnees) {
    super({ items: donnees.pointsAcces });
  }
}

module.exports = PointsAcces;

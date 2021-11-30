const ListeItems = require('./listeItems');
const PointAcces = require('./pointAcces');

class PointsAcces extends ListeItems {
  constructor(donnees) {
    super(PointAcces, { items: donnees.pointsAcces });
  }
}

module.exports = PointsAcces;

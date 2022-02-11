const EntiteExterne = require('./entiteExterne');
const ElementsConstructibles = require('./elementsConstructibles');

class EntitesExternes extends ElementsConstructibles {
  constructor(donnees) {
    super(EntiteExterne, { items: donnees.entitesExternes });
  }
}

module.exports = EntitesExternes;

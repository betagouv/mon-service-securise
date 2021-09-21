const EntiteExterne = require('./entiteExterne');
const ListeItems = require('./listeItems');

class EntitesExternes extends ListeItems {
  constructor(donnees) {
    super(EntiteExterne, { items: donnees.entitesExternes });
  }
}

module.exports = EntitesExternes;

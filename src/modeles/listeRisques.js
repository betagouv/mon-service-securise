const ListeItems = require('./listeItems');

class ListeRisques extends ListeItems {
  principaux() {
    return this.items.filter((risque) => risque.important());
  }
}

module.exports = ListeRisques;

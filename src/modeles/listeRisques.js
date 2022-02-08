const ElementsConstructibles = require('./elementsConstructibles');

class ListeRisques extends ElementsConstructibles {
  principaux() {
    return this.items.filter((risque) => risque.important());
  }
}

module.exports = ListeRisques;

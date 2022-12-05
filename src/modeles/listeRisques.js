const ElementsConstructibles = require('./elementsConstructibles');

class ListeRisques extends ElementsConstructibles {
  principaux() {
    return this.items.filter((risque) => risque.important());
  }

  parNiveauGravite(accumulateur = {}) {
    return this.tous()
      .reduce((acc, risque) => {
        acc[risque.niveauGravite] ||= [];
        acc[risque.niveauGravite].push(risque.toJSON());
        return acc;
      }, accumulateur);
  }
}

module.exports = ListeRisques;

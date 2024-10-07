const ElementsConstructibles = require('./elementsConstructibles');
const { ErreurRisqueInconnu } = require('../erreurs');

class ListeRisques extends ElementsConstructibles {
  principaux() {
    return this.items.filter((risque) => risque.important());
  }

  parNiveauGravite(accumulateur = {}) {
    return this.tous().reduce((acc, risque) => {
      acc[risque.niveauGravite] ||= [];
      acc[risque.niveauGravite].push(risque.toJSON());
      return acc;
    }, accumulateur);
  }

  ajouteRisque(risque) {
    this.items.push(risque);
  }

  metsAJourRisque(risque) {
    const index = this.items.findIndex((r) => r.id === risque.id);
    if (index === -1)
      throw new ErreurRisqueInconnu(
        `Le risque "${risque.id}" est introuvable.`
      );
    this.items[index] = risque;
  }
}

module.exports = ListeRisques;

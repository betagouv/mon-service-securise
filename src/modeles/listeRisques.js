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

  supprimeRisque(idRisque) {
    this.items = this.items.filter((r) => r.id !== idRisque);
  }

  trouveIndex(idRisque) {
    const index = this.items.findIndex((r) => r.id === idRisque);
    if (index === -1)
      throw new ErreurRisqueInconnu(`Le risque "${idRisque}" est introuvable.`);
    return index;
  }

  trouveParId(idRisque) {
    return this.items[this.trouveIndex(idRisque)];
  }

  metsAJourRisque(risque) {
    const index = this.trouveIndex(risque.id);
    this.items[index] = risque;
  }
}

module.exports = ListeRisques;

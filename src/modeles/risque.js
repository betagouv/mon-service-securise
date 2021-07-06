const { ErreurRisqueInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

const valide = (donnees, referentiel) => {
  const { id, commentaire } = donnees;
  const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
  if (!identifiantsRisquesRepertories.includes(id)) {
    throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
  }

  return { id, commentaire };
};

class Risque {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { id, commentaire } = valide(donneesRisque, referentiel);

    this.id = id;
    this.commentaire = commentaire;
  }

  toJSON() {
    const resultat = {};
    ['id', 'commentaire']
      .filter((k) => this[k])
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = Risque;

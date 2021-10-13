const Base = require('./base');
const { ErreurRisqueInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

const valide = (donnees, referentiel) => {
  const { id } = donnees;
  const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
  if (!identifiantsRisquesRepertories.includes(id)) {
    throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
  }
};

class RisqueGeneral extends Base {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['id', 'commentaire']);

    valide(donneesRisque, referentiel);

    this.renseigneProprietes(donneesRisque);
  }
}

module.exports = RisqueGeneral;

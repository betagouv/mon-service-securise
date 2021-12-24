const Base = require('./base');
const { ErreurNiveauGraviteInconnu, ErreurRisqueInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

const valide = (donnees, referentiel) => {
  const { id, niveauGravite } = donnees;

  const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
  if (!identifiantsRisquesRepertories.includes(id)) {
    throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
  }

  const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
  if (niveauGravite && !identifiantsNiveauxGravite.includes(niveauGravite)) {
    throw new ErreurNiveauGraviteInconnu(`Le niveau de gravité "${niveauGravite}" n'est pas répertorié`);
  }
};

class RisqueGeneral extends Base {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['id', 'commentaire', 'niveauGravite']);

    valide(donneesRisque, referentiel);

    this.renseigneProprietes(donneesRisque);
  }
}

module.exports = RisqueGeneral;

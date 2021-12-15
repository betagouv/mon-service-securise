const Base = require('./base');
const { ErreurNiveauGraviteInconnu } = require('../erreurs');

class Risque extends Base {
  static valide({ niveauGravite }, referentiel) {
    const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
    if (niveauGravite && !identifiantsNiveauxGravite.includes(niveauGravite)) {
      throw new ErreurNiveauGraviteInconnu(`Le niveau de gravité "${niveauGravite}" n'est pas répertorié`);
    }
  }
}

module.exports = Risque;

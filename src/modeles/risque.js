const InformationsHomologation = require('./informationsHomologation');
const { ErreurNiveauGraviteInconnu } = require('../erreurs');

class Risque extends InformationsHomologation {
  static valide({ niveauGravite }, referentiel) {
    const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
    if (niveauGravite && !identifiantsNiveauxGravite.includes(niveauGravite)) {
      throw new ErreurNiveauGraviteInconnu(`Le niveau de gravité "${niveauGravite}" n'est pas répertorié`);
    }
  }
}

module.exports = Risque;

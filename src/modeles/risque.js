const InformationsHomologation = require('./informationsHomologation');
const { ErreurNiveauGraviteInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

class Risque extends InformationsHomologation {
  constructor(proprietesRisque, referentiel = Referentiel.creeReferentielVide()) {
    super(proprietesRisque);
    this.referentiel = referentiel;
  }

  descriptionNiveauGravite() {
    return this.referentiel.descriptionNiveauGravite(this.niveauGravite);
  }

  important() {
    return !!this.referentiel.niveauGraviteImportant(this.niveauGravite);
  }

  positionNiveauGravite() {
    return this.referentiel.positionNiveauGravite(this.niveauGravite);
  }

  static valide({ niveauGravite }, referentiel) {
    const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
    if (niveauGravite && !identifiantsNiveauxGravite.includes(niveauGravite)) {
      throw new ErreurNiveauGraviteInconnu(`Le niveau de gravité "${niveauGravite}" n'est pas répertorié`);
    }
  }
}

module.exports = Risque;

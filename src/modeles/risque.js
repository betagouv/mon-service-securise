const InformationsHomologation = require('./informationsHomologation');
const NiveauGravite = require('./niveauGravite');
const Referentiel = require('../referentiel');

class Risque extends InformationsHomologation {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['niveauGravite'],
      proprietesAtomiquesFacultatives: ['commentaire'],
    });

    this.renseigneProprietes(donneesRisque);
    this.objetNiveauGravite = new NiveauGravite(this.niveauGravite, referentiel);
  }

  descriptionNiveauGravite() {
    return this.objetNiveauGravite.descriptionNiveau();
  }

  important() {
    return this.objetNiveauGravite.niveauImportant();
  }

  positionNiveauGravite() {
    return this.objetNiveauGravite.position;
  }
}

module.exports = Risque;

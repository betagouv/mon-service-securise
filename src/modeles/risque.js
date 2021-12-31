const InformationsHomologation = require('./informationsHomologation');
const NiveauGravite = require('./niveauGravite');

class Risque extends InformationsHomologation {
  constructor(donneesRisque = {}, referentiel) {
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

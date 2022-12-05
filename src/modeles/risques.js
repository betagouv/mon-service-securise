const InformationsHomologation = require('./informationsHomologation');
const RisquesGeneraux = require('./risquesGeneraux');
const RisquesSpecifiques = require('./risquesSpecifiques');

const Referentiel = require('../referentiel');

class Risques extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      listesAgregats: { risquesGeneraux: RisquesGeneraux, risquesSpecifiques: RisquesSpecifiques },
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  principaux() {
    return [this.risquesGeneraux, this.risquesSpecifiques]
      .flatMap((rs) => rs.principaux())
      .sort((rs1, rs2) => rs2.positionNiveauGravite() - rs1.positionNiveauGravite());
  }

  parNiveauGravite() {
    return this.risquesGeneraux.parNiveauGravite();
  }
}

module.exports = Risques;

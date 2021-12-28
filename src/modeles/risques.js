const InformationsHomologation = require('./informationsHomologation');
const RisquesGeneraux = require('./risquesGeneraux');
const RisquesSpecifiques = require('./risquesSpecifiques');

const Referentiel = require('../referentiel');
const { pagination } = require('../utilitaires/pagination');

class Risques extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      listesAgregats: { risquesGeneraux: RisquesGeneraux, risquesSpecifiques: RisquesSpecifiques },
    });

    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  pagines(nbRisquesParPage) {
    const tousLesRisques = [this.risquesGeneraux, this.risquesSpecifiques]
      .flatMap((rs) => rs.tous());
    return pagination(nbRisquesParPage, tousLesRisques);
  }

  principaux() {
    return [this.risquesGeneraux, this.risquesSpecifiques]
      .flatMap((rs) => rs.principaux())
      .sort((rs1, rs2) => rs2.positionNiveauGravite() - rs1.positionNiveauGravite());
  }
}

module.exports = Risques;

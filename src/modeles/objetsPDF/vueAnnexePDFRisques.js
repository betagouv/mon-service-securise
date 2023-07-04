const Referentiel = require('../../referentiel');

class VueAnnexePDFRisques {
  constructor(homologation, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.homologation = homologation;
  }

  donnees() {
    return {
      niveauxGravite: this.referentiel.infosNiveauxGraviteConcernes(true),
      nomService: this.homologation.nomService(),
      risquesParNiveauGravite: this.homologation.risques.parNiveauGravite(),
    };
  }
}

module.exports = VueAnnexePDFRisques;

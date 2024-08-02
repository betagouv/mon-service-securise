const Referentiel = require('../../referentiel');

class ObjetPDFAnnexeRisques {
  constructor(homologation, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.service = homologation;
  }

  donnees() {
    return {
      niveauxGravite: this.referentiel.infosNiveauxGraviteConcernes(true),
      nomService: this.service.nomService(),
      risquesParNiveauGravite: this.service.risques.parNiveauGravite(),
    };
  }
}

module.exports = ObjetPDFAnnexeRisques;

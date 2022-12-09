const Referentiel = require('../../referentiel');

class VueAnnexePDFMesures {
  constructor(homologation, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.homologation = homologation;
  }

  donnees() {
    return {
      statuts: this.referentiel.statutsMesures(),
      categories: this.referentiel.categoriesMesures(),
      nomService: this.homologation.nomService(),
      mesuresParStatut: this.homologation.mesuresParStatutEtCategorie(),
      nbMesuresARemplirToutesCategories: this.homologation
        .nombreTotalMesuresARemplirToutesCategories(),
    };
  }
}

module.exports = VueAnnexePDFMesures;

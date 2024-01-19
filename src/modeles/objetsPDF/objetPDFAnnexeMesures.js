const Referentiel = require('../../referentiel');

class ObjetPDFAnnexeMesures {
  constructor(service, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.service = service;
  }

  donnees() {
    const { mesuresGenerales } =
      this.service.mesures.enrichiesAvecDonneesPersonnalisees();
    const mesuresGeneralesNonRenseignes = Object.entries(
      mesuresGenerales
    ).filter(([_, mesure]) => !mesure.statut);

    const referentielsConcernes = mesuresGeneralesNonRenseignes.map(
      ([_, mesure]) => mesure.referentiel
    );
    const referentielsConcernesMesuresNonRenseignees =
      this.referentiel.formatteListeDeReferentiels(referentielsConcernes);

    return {
      statuts: this.referentiel.statutsMesures(),
      categories: this.referentiel.categoriesMesures(),
      nomService: this.service.nomService(),
      mesuresParStatut: this.service.mesuresParStatutEtCategorie(),
      nbMesuresARemplirToutesCategories:
        this.service.nombreTotalMesuresARemplirToutesCategories(),
      referentielsConcernesMesuresNonRenseignees,
    };
  }
}

module.exports = ObjetPDFAnnexeMesures;

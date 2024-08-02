const Referentiel = require('../../referentiel');

class ObjetPDFAnnexeDescription {
  constructor(service, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.service = service;
  }

  donnees() {
    const fonctionnalites = this.referentiel.descriptionsFonctionnalites(
      this.service.descriptionService.fonctionnalites
    );
    const fonctionnalitesSpecifiques =
      this.service.descriptionService.fonctionnalitesSpecifiques.descriptions();

    const donneesStockees =
      this.referentiel.descriptionsDonneesCaracterePersonnel(
        this.service.descriptionService.donneesCaracterePersonnel
      );
    const donneesStockeesSpecifiques =
      this.service.descriptionService.donneesSensiblesSpecifiques.descriptions();

    const dureeDysfonctionnementMaximumAcceptable =
      this.referentiel.descriptionDelaiAvantImpactCritique(
        this.service.descriptionService.delaiAvantImpactCritique
      );

    return {
      nomService: this.service.nomService(),
      fonctionnalites: [...fonctionnalites, ...fonctionnalitesSpecifiques],
      donneesStockees: [...donneesStockees, ...donneesStockeesSpecifiques],
      dureeDysfonctionnementMaximumAcceptable,
    };
  }
}

module.exports = ObjetPDFAnnexeDescription;

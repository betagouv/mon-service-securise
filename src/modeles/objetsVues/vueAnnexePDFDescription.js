const Referentiel = require('../../referentiel');

class VueAnnexePDFDescription {
  constructor(homologation, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.homologation = homologation;
  }

  donnees() {
    const fonctionnalites = this.referentiel.descriptionsFonctionnalites(
      this.homologation.descriptionService.fonctionnalites
    );
    const fonctionnalitesSpecifiques = this.homologation
      .descriptionService
      .fonctionnalitesSpecifiques
      .descriptions();

    const donneesStockees = this.referentiel.descriptionsDonneesCaracterePersonnel(
      this.homologation.descriptionService.donneesCaracterePersonnel
    );
    const donneesStockeesSpecifiques = this.homologation
      .descriptionService
      .donneesSensiblesSpecifiques
      .descriptions();

    const dureeDysfonctionnementMaximumAcceptable = this.referentiel
      .descriptionDelaiAvantImpactCritique(
        this.homologation.descriptionService.delaiAvantImpactCritique
      );

    return {
      nomService: this.homologation.nomService(),
      fonctionnalites: [
        ...fonctionnalites,
        ...fonctionnalitesSpecifiques,
      ],
      donneesStockees: [
        ...donneesStockees,
        ...donneesStockeesSpecifiques,
      ],
      dureeDysfonctionnementMaximumAcceptable,
    };
  }
}

module.exports = VueAnnexePDFDescription;

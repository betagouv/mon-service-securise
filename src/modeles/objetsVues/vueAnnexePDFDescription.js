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

    return {
      nomService: this.homologation.nomService(),
      fonctionnalites: [
        ...fonctionnalites,
        ...fonctionnalitesSpecifiques,
      ],
    };
  }
}

module.exports = VueAnnexePDFDescription;

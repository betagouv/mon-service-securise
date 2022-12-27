const DescriptionService = require('../../src/modeles/descriptionService');

class ConstructeurDescriptionService {
  constructor(referentiel) {
    this.referentiel = referentiel;
    this.referentiel.recharge({
      statutsDeploiement: { unStatutDeploiement: {} },
      localisationsDonnees: { uneLocalisation: {} },
    });

    this.donnees = {
      delaiAvantImpactCritique: 'unDelai',
      localisationDonnees: 'uneLocalisation',
      nomService: 'Nom service',
      presentation: 'Une présentation',
      provenanceService: 'uneProvenance',
      risqueJuridiqueFinancierReputationnel: false,
      statutDeploiement: 'unStatutDeploiement',
      typeService: 'unType',
    };
  }

  avecNomService(nomService) {
    Object.assign(this.donnees, { nomService });
    return this;
  }

  avecPresentation(presentation) {
    Object.assign(this.donnees, { presentation });
    return this;
  }

  construis() { return new DescriptionService(this.donnees, this.referentiel); }
}

const uneDescriptionValide = (referentiel) => new ConstructeurDescriptionService(referentiel);

module.exports = uneDescriptionValide;

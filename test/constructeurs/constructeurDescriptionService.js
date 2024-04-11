const DescriptionService = require('../../src/modeles/descriptionService');

class ConstructeurDescriptionService {
  constructor(referentiel) {
    this.referentiel = referentiel;
    this.referentiel.enrichis({
      statutsDeploiement: { unStatutDeploiement: {} },
      localisationsDonnees: { uneLocalisation: {} },
    });

    this.donnees = {
      delaiAvantImpactCritique: 'unDelai',
      localisationDonnees: 'uneLocalisation',
      nomService: 'Nom service',
      organisationResponsable: {
        nom: 'ANSSI',
        siret: '12345',
        departement: '75',
      },
      presentation: 'Une présentation',
      provenanceService: 'uneProvenance',
      risqueJuridiqueFinancierReputationnel: false,
      statutDeploiement: 'unStatutDeploiement',
      typeService: 'unType',
      nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
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

  deLOrganisation(organisationResponsable) {
    this.donnees.organisationResponsable = organisationResponsable;
    return this;
  }

  accessiblePar(...pointsAcces) {
    this.donnees.pointsAcces = pointsAcces.map((p) => ({ description: p }));
    return this;
  }

  construis() {
    return new DescriptionService(this.donnees, this.referentiel);
  }
}

const uneDescriptionValide = (referentiel) =>
  new ConstructeurDescriptionService(referentiel);

module.exports = uneDescriptionValide;

const DescriptionService = require('../../src/modeles/descriptionService');
const Referentiel = require('../../src/referentiel');

class ConstructeurDescriptionService {
  constructor(referentiel = Referentiel.creeReferentiel()) {
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
      statutDeploiement: 'unStatutDeploiement',
      typeService: 'unType',
      nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
      niveauSecurite: 'niveau1',
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

  deNiveau3() {
    this.donnees.delaiAvantImpactCritique = 'moinsUneHeure';
    return this;
  }

  deNiveau2() {
    this.donnees.fonctionnalites = ['reseauSocial'];
    return this;
  }

  construis() {
    return new DescriptionService(this.donnees, this.referentiel);
  }
}

const uneDescriptionValide = (referentiel) =>
  new ConstructeurDescriptionService(referentiel);

module.exports = uneDescriptionValide;

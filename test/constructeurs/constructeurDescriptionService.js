import DescriptionService from '../../src/modeles/descriptionService.js';
import * as Referentiel from '../../src/referentiel.js';

class ConstructeurDescriptionService {
  constructor(
    referentiel = Referentiel.creeReferentiel(),
    avecEnrichissementReferentiel = true
  ) {
    this.referentiel = referentiel;
    if (avecEnrichissementReferentiel)
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

  avecTypes(types) {
    this.donnees.typeService = types;
    return this;
  }

  avecFonctionnalites(fonctionnalites) {
    this.donnees.fonctionnalites = fonctionnalites;
    return this;
  }

  avecProvenance(provenance) {
    this.donnees.provenanceService = provenance;
    return this;
  }

  avecLocalisation(localisation) {
    this.donnees.localisationDonnees = localisation;
    return this;
  }

  avecStatut(statut) {
    this.donnees.statutDeploiement = statut;
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
    this.donnees.niveauSecurite = 'niveau3';
    return this;
  }

  deNiveau2() {
    this.donnees.fonctionnalites = ['reseauSocial'];
    this.donnees.niveauSecurite = 'niveau2';
    return this;
  }

  construis() {
    return new DescriptionService(this.donnees, this.referentiel);
  }
}

const uneDescriptionValide = (
  referentiel,
  avecEnrichissementReferentiel = true
) =>
  new ConstructeurDescriptionService(
    referentiel,
    avecEnrichissementReferentiel
  );

export default uneDescriptionValide;

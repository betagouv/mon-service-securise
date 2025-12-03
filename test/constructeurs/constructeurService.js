import uneDescriptionValide from './constructeurDescriptionService.js';
import * as Referentiel from '../../src/referentiel.js';
import Service from '../../src/modeles/service.js';
import { unUtilisateur } from './constructeurUtilisateur.js';
import { VersionService } from '../../src/modeles/versionService.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';
import { uneDescriptionV2Valide } from './constructeurDescriptionServiceV2.js';

class ConstructeurService {
  constructor(referentiel) {
    this.donnees = {
      id: '',
      versionService: VersionService.v1,
      descriptionService: uneDescriptionValide(referentiel).donnees,
      contributeurs: [],
      suggestionsActions: [],
    };
    this.mesures = undefined;
    this.risques = undefined;
    this.referentiel = referentiel;
  }

  construis() {
    const service = new Service(this.donnees, this.referentiel);
    if (this.mesures !== undefined) service.mesures = this.mesures;
    if (this.risques !== undefined) service.risques = this.risques;
    return service;
  }

  avecDossiers(dossiers) {
    this.donnees.dossiers = dossiers;
    return this;
  }

  avecDescription(description) {
    this.donnees.descriptionService = description;
    return this;
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  avecMesures(mesures) {
    this.mesures = mesures;
    return this;
  }

  avecRisques(risques) {
    this.risques = risques;
    return this;
  }

  avecNomService(nomService) {
    this.donnees.descriptionService.nomService = nomService;
    return this;
  }

  avecOrganisationResponsable(organisationResponsable) {
    this.donnees.descriptionService.organisationResponsable =
      organisationResponsable;
    return this;
  }

  avecNContributeurs(combien, ids = []) {
    for (let i = 0; i < combien; i += 1) {
      let { donnees } = unUtilisateur();
      if (ids.length) {
        donnees = unUtilisateur().avecId(ids[i]).donnees;
      }
      this.donnees.contributeurs.push(donnees);
    }
    return this;
  }

  ajouteUnContributeur(contributeur) {
    this.donnees.contributeurs.push(contributeur);
    return this;
  }

  avecSuggestionAction(suggestion) {
    this.donnees.suggestionsActions.push(suggestion);
    return this;
  }

  avecVersion(version) {
    this.donnees.versionService = version;
    return this;
  }

  avecUneSimulationExistante() {
    this.donnees.aUneSimulationMigrationReferentiel = true;
    return this;
  }
}

const unService = (referentiel = Referentiel.creeReferentielVide()) =>
  new ConstructeurService(referentiel);

const unServiceV2 = (referentiel = creeReferentielV2()) =>
  new ConstructeurService(referentiel)
    .avecVersion(VersionService.v2)
    .avecDescription(uneDescriptionV2Valide().donneesDescription());

export { unService, unServiceV2 };

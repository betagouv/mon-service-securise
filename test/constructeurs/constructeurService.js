const uneDescriptionValide = require('./constructeurDescriptionService');
const Referentiel = require('../../src/referentiel');
const Service = require('../../src/modeles/service');
const { unUtilisateur } = require('./constructeurUtilisateur');

class ConstructeurService {
  constructor(referentiel) {
    this.donnees = {
      id: '',
      descriptionService: uneDescriptionValide(referentiel).donnees,
      contributeurs: [],
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
    this.donnees.descriptionService.organisationsResponsables = [
      organisationResponsable,
    ];
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
}

const unService = (referentiel = Referentiel.creeReferentielVide()) =>
  new ConstructeurService(referentiel);

module.exports = { unService };

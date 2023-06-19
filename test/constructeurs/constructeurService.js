const uneDescriptionValide = require('./constructeurDescriptionService');
const Referentiel = require('../../src/referentiel');
const Service = require('../../src/modeles/service');

class ConstructeurService {
  constructor(referentiel) {
    this.donnees = {
      id: '',
      descriptionService: uneDescriptionValide(referentiel).donnees,
    };
    this.mesures = undefined;
    this.referentiel = referentiel;
  }

  construis() {
    const service = new Service(this.donnees, this.referentiel);
    if (this.mesures !== undefined) {
      service.mesures = this.mesures;
    }
    return service;
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  avecMesures(mesures) {
    this.mesures = mesures;
    return this;
  }

  avecNomService(nomService) {
    this.donnees.descriptionService.nomService = nomService;
    return this;
  }
}

const unService = (referentiel = Referentiel.creeReferentielVide()) =>
  new ConstructeurService(referentiel);

module.exports = { unService };

const uneDescriptionValide = require('./constructeurDescriptionService');
const Referentiel = require('../../src/referentiel');
const Service = require('../../src/modeles/service');

class ConstructeurService {
  constructor(referentiel) {
    this.donnees = {
      id: '',
      descriptionService: uneDescriptionValide(referentiel).donnees,
    };
  }

  construis() {
    return new Service(this.donnees);
  }

  avecId(id) {
    this.donnees.id = id;
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

const Service = require('../../src/modeles/service');

class ConstructeurService {
  constructor() {
    this.donnees = {
      id: '',
      descriptionService: {
        nomService: '',
      },
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

module.exports = ConstructeurService;

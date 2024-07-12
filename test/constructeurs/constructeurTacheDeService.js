const { unService } = require('./constructeurService');

class ConstructeurTacheDeService {
  constructor() {
    this.donnees = {
      nature: 'natureDeTest',
      titre: '',
      service: unService().avecNomService('Le service').construis(),
    };
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  avecUnServiceNomme(nomService) {
    this.donnees.service = unService().avecNomService(nomService).construis();
    return this;
  }

  avecUnServiceId(idService) {
    this.donnees.service = unService().avecId(idService).construis();
    return this;
  }

  avecNature(nature) {
    this.donnees.nature = nature;
    return this;
  }

  avecDateDeCreation(date) {
    this.donnees.dateCreation = date;
    return this;
  }

  faiteMaintenant() {
    this.donnees.dateFaite = new Date();
    return this;
  }

  pasFaite() {
    this.donnees.dateFaite = null;
    return this;
  }

  avecLesDonnees(donnees) {
    this.donnees.donnees = donnees;
    return this;
  }

  construis() {
    return this.donnees;
  }
}

const uneTacheDeService = () => new ConstructeurTacheDeService();

module.exports = { uneTacheDeService };

const EvenementCompletudeServiceModifiee = require('../../../src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const { unService } = require('../../constructeurs/constructeurService');

class ConstructeurEvenementCompletudeServiceModifiee {
  constructor() {
    const service = unService().avecId('abc').construis();
    this.donnees = { service };
    this.date = '14/02/2023';
    this.adaptateurChiffrement = { hacheSha256: (valeur) => valeur };
  }

  avecService(service) {
    this.donnees.service = service;
    return this;
  }

  avecIdService(idService) {
    this.donnees.service.id = idService;
    return this;
  }

  quiChiffreAvec(adaptateurChiffrement) {
    this.adaptateurChiffrement = adaptateurChiffrement;
    return this;
  }

  sans(propriete) {
    delete this.donnees[propriete];
    return this;
  }

  avecNombreOrganisationsUtilisatricesInconnu() {
    this.donnees.service.descriptionService.nombreOrganisationsUtilisatrices.borneBasse =
      '0';
    this.donnees.service.descriptionService.nombreOrganisationsUtilisatrices.borneHaute =
      '0';
    return this;
  }

  construis() {
    return new EvenementCompletudeServiceModifiee(this.donnees, {
      date: this.date,
      adaptateurChiffrement: this.adaptateurChiffrement,
    });
  }
}

module.exports = ConstructeurEvenementCompletudeServiceModifiee;

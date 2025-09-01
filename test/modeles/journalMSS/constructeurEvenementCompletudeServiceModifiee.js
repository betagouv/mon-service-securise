import EvenementCompletudeServiceModifiee from '../../../src/modeles/journalMSS/evenementCompletudeServiceModifiee.js';
import { unService } from '../../constructeurs/constructeurService.js';

class ConstructeurEvenementCompletudeServiceModifiee {
  constructor() {
    const service = unService().avecId('abc').construis();
    this.donnees = { service, organisationResponsable: {} };
    this.date = '14/02/2023';
    this.adaptateurChiffrement = { hacheSha256: (valeur) => valeur };
  }

  quiAEuLieuLe(date) {
    this.date = date;
    return this;
  }

  deLOrganisation(organisationResponsable) {
    this.donnees.organisationResponsable = organisationResponsable;
    return this;
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

export default ConstructeurEvenementCompletudeServiceModifiee;

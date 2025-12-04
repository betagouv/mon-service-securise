import EvenementCompletudeServiceModifiee from '../../../src/modeles/journalMSS/evenementCompletudeServiceModifiee.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import { VersionService } from '../../../src/modeles/versionService.js';

class ConstructeurEvenementCompletudeServiceModifiee {
  constructor(versionService) {
    const service = (
      versionService === VersionService.v1 ? unService() : unServiceV2()
    )
      .avecId('abc')
      .construis();
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

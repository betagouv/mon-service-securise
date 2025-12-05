import Evenement from './evenement.js';
import Service from '../service.js';
import { completudeV1 } from './evenementCompletudeServiceModifiee.serviceV1.js';
import { VersionService } from '../versionService.js';
import { completudeV2 } from './evenementCompletudeServiceModifiee.serviceV2.js';
import { completudeCommune } from './evenementCompletudeServiceModifiee.commun.js';

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees: { service: Service }, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['service']);

    const { service } = donnees;

    const donneesCommunes = completudeCommune(service, adaptateurChiffrement);
    const donneesSpecifiques =
      service.version() === VersionService.v1
        ? completudeV1(service)
        : completudeV2(service, adaptateurChiffrement);

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      { ...donneesCommunes, ...donneesSpecifiques },
      date
    );
  }
}

export default EvenementCompletudeServiceModifiee;

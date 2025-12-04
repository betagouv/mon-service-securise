import Evenement from './evenement.js';
import Service from '../service.js';
import { completudeV1 } from './evenementCompletudeServiceModifiee.serviceV1.js';
import { VersionService } from '../versionService.js';
import { ErreurJournal } from './erreurs.js';

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees: { service: Service }, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['service']);

    const { service } = donnees;

    if (service.version() !== VersionService.v1)
      throw new ErreurJournal(
        `Impossible de générer la complétude pour ${service.version()}. Seule v1 est supportée.`
      );

    const donneesJournal = completudeV1(service, adaptateurChiffrement);
    super('COMPLETUDE_SERVICE_MODIFIEE', donneesJournal, date);
  }
}

export default EvenementCompletudeServiceModifiee;

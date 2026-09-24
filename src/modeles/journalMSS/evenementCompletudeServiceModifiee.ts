import Evenement, { Hacheur } from './evenement.js';
import Service from '../service.js';
import { completudeV1 } from './evenementCompletudeServiceModifiee.serviceV1.js';
import { VersionService } from '../versionService.js';
import { completudeV2 } from './evenementCompletudeServiceModifiee.serviceV2.js';
import { completudeCommune } from './evenementCompletudeServiceModifiee.commun.js';

type Donnees = { service: Service };

class EvenementCompletudeServiceModifiee extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'COMPLETUDE_SERVICE_MODIFIEE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['service'];
  }

  protected override donneesAConsigner({ service }: Donnees, hache: Hacheur) {
    const donneesCommunes = completudeCommune(service, hache);
    const donneesSpecifiques =
      service.version() === VersionService.v1
        ? completudeV1(service)
        : completudeV2(service);

    return { ...donneesCommunes, ...donneesSpecifiques };
  }
}

export default EvenementCompletudeServiceModifiee;

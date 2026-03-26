import type Service from '../service.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';

class ObjetPDFAnnexeRisques {
  private readonly referentiel: ReferentielV2;
  private readonly service: Service;
  private readonly risques: RisquesV2;

  constructor(service: Service, referentiel: ReferentielV2) {
    this.referentiel = referentiel;
    this.service = service;
    this.risques = this.service.risquesV2!;
  }

  donnees() {
    return {
      nomService: this.service.nomService(),
      risques: this.risques.toJSON(),
    };
  }
}

export default ObjetPDFAnnexeRisques;

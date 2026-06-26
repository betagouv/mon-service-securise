import { UUID } from '../typesBasiques.js';
import { ErreurDonneesObligatoiresManquantes } from '../erreurs.js';
import { RisquesV2 } from '../moteurRisques/v2/risquesV2.js';

export class EvenementRisquesV2ServiceModifies {
  readonly idService: UUID;
  readonly risques: RisquesV2;

  constructor(idService: UUID, risques: RisquesV2) {
    if (!idService)
      throw new ErreurDonneesObligatoiresManquantes("L'ID Service est requis");
    if (!risques)
      throw new ErreurDonneesObligatoiresManquantes('Les risques sont requis');

    this.risques = risques;
    this.idService = idService;
  }
}

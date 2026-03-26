import InformationsService from '../informationsService.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { ProprietesBase } from '../base.js';

abstract class Etape extends InformationsService {
  protected constructor(
    donnees: ProprietesBase,
    referentiel?: TousReferentiels
  ) {
    super(donnees);
    if (referentiel) this.referentiel = referentiel;
  }

  abstract estComplete(): void;
}

export default Etape;

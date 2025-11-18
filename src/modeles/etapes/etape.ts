import InformationsService from '../informationsService.js';
import { Referentiel } from '../../referentiel.interface.js';
import { ProprietesBase } from '../base.js';

abstract class Etape extends InformationsService {
  protected constructor(donnees: ProprietesBase, referentiel?: Referentiel) {
    super(donnees);
    if (referentiel) this.referentiel = referentiel;
  }

  abstract estComplete(): void;
}

export default Etape;

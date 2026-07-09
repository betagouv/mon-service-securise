import ListeItems from './listeItems.js';
import InformationsService from './informationsService.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

type Fabrique<T extends InformationsService> = {
  cree: (donnees: Record<string, unknown>) => T;
};

class ElementsFabricables<T extends InformationsService> extends ListeItems<T> {
  constructor(
    fabrique: Fabrique<T>,
    donnees: { items: Array<Record<string, unknown>> },
    referentiel: TousReferentiels = creeReferentielVide()
  ) {
    super(fabrique.cree, donnees, referentiel);
  }
}

export default ElementsFabricables;

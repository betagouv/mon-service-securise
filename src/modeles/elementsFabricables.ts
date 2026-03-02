import ListeItems from './listeItems.js';
import InformationsService from './informationsService.js';

type FabriqueElements<T> = {
  cree: (donnees: Record<string, unknown>) => T;
};

class ElementsFabricables<
  TItem extends InformationsService,
> extends ListeItems<TItem> {
  constructor(
    Fabrique: FabriqueElements<TItem>,
    donnees: { items: Array<Record<string, unknown>> }
  ) {
    super(Fabrique.cree, donnees);
  }
}

export default ElementsFabricables;

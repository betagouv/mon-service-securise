import ElementsConstructibles from './elementsConstructibles.js';
import ItemAvecDescription, {
  DonneesItemAvecDescription,
} from './itemAvecDescription.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

type DonneesItemsAvecDescription = {
  items: Array<Partial<DonneesItemAvecDescription>>;
};

class ItemsAvecDescription extends ElementsConstructibles<ItemAvecDescription> {
  constructor(
    donnees: DonneesItemsAvecDescription,
    referentiel: TousReferentiels = creeReferentielVide()
  ) {
    super(ItemAvecDescription, donnees, referentiel);
  }

  descriptions() {
    return this.tous().map((item) => item.description);
  }

  static proprietesItem() {
    return ItemAvecDescription.proprietes();
  }
}

export default ItemsAvecDescription;

import ElementsConstructibles from './elementsConstructibles.js';
import ItemAvecDescription from './itemAvecDescription.js';

class ItemsAvecDescription extends ElementsConstructibles {
  constructor(items) {
    super(ItemAvecDescription, items);
  }

  descriptions() {
    return this.tous().map((item) => item.description);
  }

  static proprietesItem() {
    return ItemAvecDescription.proprietes();
  }
}

export default ItemsAvecDescription;

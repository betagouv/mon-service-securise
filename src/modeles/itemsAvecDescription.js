const ElementsConstructibles = require('./elementsConstructibles');
const ItemAvecDescription = require('./itemAvecDescription');

class ItemsAvecDescription extends ElementsConstructibles {
  constructor(items) {
    super(ItemAvecDescription, items);
  }

  static proprietesItem() {
    return ItemAvecDescription.proprietes();
  }
}

module.exports = ItemsAvecDescription;

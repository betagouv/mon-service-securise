const ElementsConstructibles = require('./elementsConstructibles');
const ItemAvecDescription = require('./itemAvecDescription');

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

module.exports = ItemsAvecDescription;

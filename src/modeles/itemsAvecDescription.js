const ListeItems = require('./listeItems');
const ItemAvecDescription = require('./itemAvecDescription');

class ItemsAvecDescription extends ListeItems {
  constructor(items) {
    super(ItemAvecDescription, items);
  }

  static proprietesItem() {
    return ItemAvecDescription.proprietes();
  }
}

module.exports = ItemsAvecDescription;

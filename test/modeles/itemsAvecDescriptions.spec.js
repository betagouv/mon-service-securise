const expect = require('expect.js');

const ItemsAvecDescription = require('../../src/modeles/itemsAvecDescription');

const ils = it;

describe('Les items avec descriptions', () => {
  ils('savent se dénombrer', () => {
    const itemsAvecDescription = new ItemsAvecDescription(
      { items: [
        { description: 'Une description' },
        { description: 'Une autre description' },
      ] }
    );
    expect(itemsAvecDescription.nombre()).to.equal(2);
  });

  ils("donnent la liste des propriétés de l'item", () => {
    expect(ItemsAvecDescription.proprietesItem()).to.eql(['description']);
  });
});

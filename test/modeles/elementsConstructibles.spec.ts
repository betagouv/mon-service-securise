const expect = require('expect.js');

const ElementsConstructibles = require('../../src/modeles/elementsConstructibles');

describe("Une liste d'éléments constructibles", () => {
  it('retourne tous les items sous forme de tableau', () => {
    const items = new ElementsConstructibles(Object, {
      items: [{ v: 1 }, { v: 2 }, { v: 3 }],
    });
    const tousLesItems = items.tous();
    expect(tousLesItems.length).to.equal(3);
    expect(tousLesItems[0].v).to.equal(1);
  });
});

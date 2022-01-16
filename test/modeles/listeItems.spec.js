const expect = require('expect.js');

const ListeItems = require('../../src/modeles/listeItems');

describe("Une liste d'items", () => {
  it('retourne tous les items sous forme de tableau', () => {
    const items = new ListeItems(Object, { items: [{ v: 1 }, { v: 2 }, { v: 3 }] });
    const tousLesItems = items.tous();
    expect(tousLesItems.length).to.equal(3);
    expect(tousLesItems[0].v).to.equal(1);
  });
});

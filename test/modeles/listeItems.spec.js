const expect = require('expect.js');

const ListeItems = require('../../src/modeles/listeItems');

describe("Une liste d'items", () => {
  it('renvoie une liste de tous les items si la taille est inférieure à la pagination', () => {
    const chaines = new ListeItems(Object, { items: [{ v: 1 }, { v: 2 }] });
    expect(chaines.paginees(2)).to.eql([[{ v: 1 }, { v: 2 }]]);
  });

  it('sépare les items en plusieurs listes de taille de la pagination', () => {
    const chaines = new ListeItems(Object, { items: [{ v: 1 }, { v: 2 }] });
    expect(chaines.paginees(1)).to.eql([[{ v: 1 }], [{ v: 2 }]]);
  });

  it('termine la dernière page avec les items restants', () => {
    const chaines = new ListeItems(Object, { items: [{ v: 1 }, { v: 2 }, { v: 3 }] });
    expect(chaines.paginees(2)).to.eql([[{ v: 1 }, { v: 2 }], [{ v: 3 }]]);
  });

  it("sait paginer une liste d'items vide", () => {
    const chaines = new ListeItems(Object, { items: [] });
    expect(chaines.paginees(2)).to.eql([[]]);
  });
});

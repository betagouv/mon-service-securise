const expect = require('expect.js');

const { pagination } = require('../../src/utilitaires/pagination');

describe("l'utilitaire de pagination", () => {
  it('renvoie une liste de tous les items si la taille est inférieure à la pagination', () => {
    const elements = [{ v: 1 }, { v: 2 }];
    expect(pagination(2, elements)).to.eql([[{ v: 1 }, { v: 2 }]]);
  });

  it('sépare les items en plusieurs listes de taille de la pagination', () => {
    const elements = [{ v: 1 }, { v: 2 }];
    expect(pagination(1, elements)).to.eql([[{ v: 1 }], [{ v: 2 }]]);
  });

  it('termine la dernière page avec les items restants', () => {
    const elements = [{ v: 1 }, { v: 2 }, { v: 3 }];
    expect(pagination(2, elements)).to.eql([[{ v: 1 }, { v: 2 }], [{ v: 3 }]]);
  });

  it("sait paginer une liste d'items vide", () => {
    expect(pagination(2, [])).to.eql([[]]);
  });
});

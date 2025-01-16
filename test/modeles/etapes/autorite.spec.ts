const expect = require('expect.js');

const Autorite = require('../../../src/modeles/etapes/autorite');

describe("L'étape « Autorité » du parcours homologuer", () => {
  it('est complète quand les propriétés nom et fonction sont présentes', () => {
    expect(
      new Autorite({
        nom: 'Jean Courage',
        fonction: 'Responsable',
      }).estComplete()
    ).to.be(true);
  });

  it("n'est pas complète quand toutes les propriétés sont absentes", () => {
    expect(new Autorite().estComplete()).to.be(false);
  });

  it("n'est pas complète quand le nom est absent", () => {
    expect(new Autorite({ fonction: 'Responsable' }).estComplete()).to.be(
      false
    );
  });

  it("n'est pas complète quand la fonction est absente", () => {
    expect(new Autorite({ nom: 'Jean Courage' }).estComplete()).to.be(false);
  });
});

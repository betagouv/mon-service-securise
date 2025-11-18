import Autorite from '../../../src/modeles/etapes/autorite.js';

describe("L'étape « Autorité » du parcours homologuer", () => {
  it('est complète quand les propriétés nom et fonction sont présentes', () => {
    expect(
      new Autorite({
        nom: 'Jean Courage',
        fonction: 'Responsable',
      }).estComplete()
    ).toBe(true);
  });

  it("n'est pas complète quand toutes les propriétés sont absentes", () => {
    expect(new Autorite().estComplete()).toBe(false);
  });

  it("n'est pas complète quand le nom est absent", () => {
    expect(new Autorite({ fonction: 'Responsable' }).estComplete()).toBe(false);
  });

  it("n'est pas complète quand la fonction est absente", () => {
    expect(new Autorite({ nom: 'Jean Courage' }).estComplete()).toBe(false);
  });
});

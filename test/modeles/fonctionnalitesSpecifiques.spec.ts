import FonctionnalitesSpecifiques from '../../src/modeles/fonctionnalitesSpecifiques.js';

describe('Les fonctionnalités spécifiques', () => {
  it("se construisent avec le bon nom d'item", () => {
    const fonctionnalitesSpecifiques = new FonctionnalitesSpecifiques({
      fonctionnalitesSpecifiques: [],
    });

    expect(fonctionnalitesSpecifiques.nombre()).toEqual(0);
  });
});

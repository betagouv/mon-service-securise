import DonneesSensiblesSpecifiques from '../../src/modeles/donneesSensiblesSpecifiques.js';

describe('Les donnees sensibles spécifiques', () => {
  it("se construisent avec le bon nom d'item", () => {
    const donneesSensiblesSpecifiques = new DonneesSensiblesSpecifiques({
      donneesSensiblesSpecifiques: [],
    });

    expect(donneesSensiblesSpecifiques.nombre()).toEqual(0);
  });
});

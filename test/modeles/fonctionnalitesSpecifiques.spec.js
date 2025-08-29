import expect from 'expect.js';
import FonctionnalitesSpecifiques from '../../src/modeles/fonctionnalitesSpecifiques.js';

const elles = it;

describe('Les fonctionnalités spécifiques', () => {
  elles("se construisent avec le bon nom d'item", () => {
    const fonctionnalitesSpecifiques = new FonctionnalitesSpecifiques({
      fonctionnalitesSpecifiques: [],
    });

    expect(fonctionnalitesSpecifiques.nombre()).to.equal(0);
  });
});

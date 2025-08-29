import expect from 'expect.js';
import Etape from '../../../src/modeles/etapes/etape.js';

describe('Une étape', () => {
  it("jette une erreur lorsqu'on lui demande si elle est complète, afin de forcer l'implémentation par héritage", () => {
    expect(() => new Etape().estComplete()).to.throwException();
  });
});

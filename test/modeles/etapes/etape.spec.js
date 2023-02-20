const expect = require('expect.js');
const Etape = require('../../../src/modeles/etapes/etape');

describe('Une étape', () => {
  it("jette une erreur lorsqu'on lui demande si elle est complète, afin de forcer l'implémentation par héritage", () => {
    expect(() => new Etape().estComplete()).to.throwException();
  });
});
